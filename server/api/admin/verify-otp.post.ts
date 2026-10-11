import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import { adminUser, passwordResetToken } from '../../database/schema'
import { verifyOtpSchema } from '../../../shared/schemas/auth'

const MAX_ATTEMPTS = 5
const RESET_TOKEN_TTL_MS = 15 * 60_000
const INVALID = 'That code is incorrect or has expired. Request a new one.'

/**
 * Checks the emailed 6-digit code. On success the code is swapped for a single-use reset token
 * that /api/admin/reset-password accepts, so the code itself can never set a password.
 */
export default defineEventHandler(async (event) => {
  const { email, otp } = await readValid(event, verifyOtpSchema)
  const db = useDb()
  const [user] = await db.select().from(adminUser).where(eq(adminUser.email, email.toLowerCase()))
  if (!user) throw apiError(400, INVALID)

  const [row] = await db
    .select()
    .from(passwordResetToken)
    .where(and(eq(passwordResetToken.userId, user.id), isNull(passwordResetToken.usedAt), gt(passwordResetToken.expiresAt, new Date())))
    .orderBy(desc(passwordResetToken.createdAt))
    .limit(1)
  if (!row) throw apiError(400, INVALID)

  if (!safeEqual(row.tokenHash, otpHash(user.id, otp))) {
    const attempts = row.attempts + 1
    await db
      .update(passwordResetToken)
      .set(attempts >= MAX_ATTEMPTS ? { attempts, usedAt: new Date() } : { attempts })
      .where(eq(passwordResetToken.id, row.id))
    throw apiError(400, attempts >= MAX_ATTEMPTS ? 'Too many wrong codes. Request a new one.' : INVALID)
  }

  const resetToken = randomToken()
  await db
    .update(passwordResetToken)
    .set({ tokenHash: sha256(resetToken), expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS), attempts: 0 })
    .where(eq(passwordResetToken.id, row.id))
  return { ok: true, resetToken }
})
