import { eq } from 'drizzle-orm'
import { adminUser, passwordResetToken } from '../../database/schema'
import { forgotPasswordSchema } from '../../../shared/schemas/auth'

const TOKEN_TTL_MS = 30 * 60_000

export default defineEventHandler(async (event) => {
  const { email } = await readValid(event, forgotPasswordSchema)
  const db = useDb()
  const [user] = await db.select().from(adminUser).where(eq(adminUser.email, email.toLowerCase()))

  if (user) {
    const token = randomToken()
    await db.insert(passwordResetToken).values({
      userId: user.id,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS)
    })
    const settings = await getSettings()
    const mail = passwordResetEmail(settings.general.siteTitle, appUrl(`/admin/reset-password?token=${token}`))
    void sendMail({ to: user.email, kind: 'password_reset', ...mail })
  }

  // Same response whether or not the account exists.
  return { ok: true }
})
