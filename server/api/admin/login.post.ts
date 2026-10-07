import { and, count, eq } from 'drizzle-orm'
import { TOTP, Secret } from 'otpauth'
import { adminSession, adminUser, loginAttempt } from '../../database/schema'
import { loginSchema } from '../../../shared/schemas/auth'

const MAX_FAILURES = 5
const LOCK_MINUTES = 15

// Verified against when the account does not exist, so timing does not reveal valid emails.
const dummyHash = hashAdminPassword('timing-equaliser')

export default defineEventHandler(async (event) => {
  const input = await readValid(event, loginSchema)
  const db = useDb()
  const email = input.email.toLowerCase()
  const ip = clientIp(event)
  const ua = userAgent(event)
  const settings = await getSettings()

  const record = (success: boolean, reason?: string) =>
    db.insert(loginAttempt).values({ email, ip, userAgent: ua, success, reason: reason ?? null })

  const [user] = await db.select().from(adminUser).where(eq(adminUser.email, email))

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    await record(false, 'locked')
    throw apiError(429, 'Too many failed attempts. Try again in a few minutes.')
  }

  // Always run a hash comparison so response time does not reveal whether the account exists.
  const hashMatches = await verifyAdminPassword(user?.passwordHash ?? (await dummyHash), input.password)
  const passwordOk = Boolean(user) && hashMatches

  if (!user || !passwordOk) {
    await record(false, 'bad_credentials')
    if (user) {
      const failures = user.failedAttempts + 1
      const lock = failures >= MAX_FAILURES
      await db
        .update(adminUser)
        .set({ failedAttempts: lock ? 0 : failures, lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null })
        .where(eq(adminUser.id, user.id))
      if (lock) {
        const mail = alertEmail(
          settings.general.siteTitle,
          'Admin account temporarily locked',
          [`${MAX_FAILURES} failed sign-in attempts for ${email} from ${ip}.`, `The account is locked for ${LOCK_MINUTES} minutes.`],
          appUrl('/admin/security')
        )
        await notify({ type: 'login_alert', title: 'Failed-login spike: account locked', body: `${MAX_FAILURES} failed attempts from ${ip}`, link: '/admin/security', preference: 'onLoginAlert', email: mail })
      }
    }
    throw apiError(401, 'Invalid email or password.')
  }

  if (user.totpEnabled && user.totpSecret) {
    if (!input.totp) return { requiresTotp: true }
    const totp = new TOTP({ secret: Secret.fromBase32(user.totpSecret), issuer: 'Portfolio Admin', label: user.email })
    if (totp.validate({ token: input.totp.replace(/\s/g, ''), window: 1 }) === null) {
      await record(false, 'bad_totp')
      throw apiError(401, 'That authentication code is not valid.')
    }
  }

  const deviceHash = sha256(ua)
  const [{ known } = { known: 0 }] = await db
    .select({ known: count() })
    .from(adminSession)
    .where(and(eq(adminSession.userId, user.id), eq(adminSession.deviceHash, deviceHash)))
  const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(adminSession).where(eq(adminSession.userId, user.id))

  const [session] = await db
    .insert(adminSession)
    .values({ userId: user.id, ip, userAgent: ua, deviceHash })
    .returning({ id: adminSession.id })
  if (!session) throw apiError(500, 'Could not start a session')

  await db.update(adminUser).set({ failedAttempts: 0, lockedUntil: null }).where(eq(adminUser.id, user.id))
  await record(true)
  await setUserSession(event, { user: { id: user.id, name: user.name, email: user.email }, secure: { sid: session.id } })
  await logActivity(user.email, 'login', 'session', session.id, `Signed in from ${ip}`)

  // Flag sign-ins from a device we have not seen before (skip the very first login ever).
  if (total > 0 && known === 0) {
    const mail = alertEmail(
      settings.general.siteTitle,
      'New sign-in to your admin panel',
      [`A sign-in from a new device was detected.`, `IP address: ${ip}`, `Device: ${ua || 'unknown'}`, 'If this was not you, change your password and revoke sessions.'],
      appUrl('/admin/security')
    )
    void notify({ type: 'login_alert', title: 'Sign-in from a new device', body: `${ip} · ${ua.slice(0, 80)}`, link: '/admin/security', preference: 'onLoginAlert', email: mail })
  }

  return { ok: true }
})
