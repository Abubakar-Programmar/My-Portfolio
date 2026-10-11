import { and, eq, gt, isNull } from 'drizzle-orm'
import { adminSession, adminUser, passwordResetToken } from '../../database/schema'
import { resetPasswordSchema } from '../../../shared/schemas/auth'

/** Sets a new password using the single-use token issued by /api/admin/verify-otp. */
export default defineEventHandler(async (event) => {
  const { token, password } = await readValid(event, resetPasswordSchema)
  const db = useDb()
  const [row] = await db
    .select()
    .from(passwordResetToken)
    .where(and(eq(passwordResetToken.tokenHash, sha256(token)), isNull(passwordResetToken.usedAt), gt(passwordResetToken.expiresAt, new Date())))
  if (!row) throw apiError(400, 'Your verification has expired. Please start again.')

  const [user] = await db.select().from(adminUser).where(eq(adminUser.id, row.userId))
  if (!user) throw apiError(400, 'Your verification has expired. Please start again.')
  if (await verifyAdminPassword(user.passwordHash, password)) {
    throw apiError(400, 'You cannot reuse your previous password. Choose a new one.', { password: 'You cannot reuse your previous password' })
  }

  const passwordHash = await hashAdminPassword(password)
  await db.update(adminUser).set({ passwordHash, failedAttempts: 0, lockedUntil: null }).where(eq(adminUser.id, row.userId))
  await db.update(passwordResetToken).set({ usedAt: new Date() }).where(eq(passwordResetToken.id, row.id))
  await db.update(adminSession).set({ revokedAt: new Date() }).where(and(eq(adminSession.userId, row.userId), isNull(adminSession.revokedAt)))
  await logActivity('system', 'security', 'admin_user', row.userId, 'Password reset via emailed code')
  return { ok: true }
})
