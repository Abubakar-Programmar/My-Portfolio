import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import { adminUser, passwordResetToken } from '../../database/schema'
import { forgotPasswordSchema } from '../../../shared/schemas/auth'

const OTP_TTL_MINUTES = 10
const RESEND_COOLDOWN_MS = 60_000

/** Emails a 6-digit one-time code to the admin account. The response never reveals whether the account exists. */
export default defineEventHandler(async (event) => {
  const { email } = await readValid(event, forgotPasswordSchema)
  const db = useDb()
  const [user] = await db.select().from(adminUser).where(eq(adminUser.email, email.toLowerCase()))

  if (user) {
    const [latest] = await db
      .select({ createdAt: passwordResetToken.createdAt })
      .from(passwordResetToken)
      .where(and(eq(passwordResetToken.userId, user.id), isNull(passwordResetToken.usedAt), gt(passwordResetToken.expiresAt, new Date())))
      .orderBy(desc(passwordResetToken.createdAt))
      .limit(1)

    // Resend throttle: ignore requests that arrive right after a code was sent.
    if (!latest || Date.now() - latest.createdAt.getTime() >= RESEND_COOLDOWN_MS) {
      // Only the newest code is ever valid.
      await db
        .update(passwordResetToken)
        .set({ usedAt: new Date() })
        .where(and(eq(passwordResetToken.userId, user.id), isNull(passwordResetToken.usedAt)))

      const otp = generateOtp()
      await db.insert(passwordResetToken).values({
        userId: user.id,
        tokenHash: otpHash(user.id, otp),
        expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000)
      })
      const settings = await getSettings()
      const mail = passwordResetOtpEmail(settings.general.siteTitle, otp, OTP_TTL_MINUTES)
      void sendMail({ to: user.email, kind: 'password_reset', ...mail })
    }
  }

  return { ok: true }
})
