import { and, eq, gt, isNull } from 'drizzle-orm'
import { adminSession, adminUser, passwordResetToken } from '../../database/schema'
import { resetPasswordSchema } from '../../../shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const { token, password } = await readValid(event, resetPasswordSchema)
  const db = useDb()
  const [row] = await db
    .select()
    .from(passwordResetToken)
    .where(and(eq(passwordResetToken.tokenHash, sha256(token)), isNull(passwordResetToken.usedAt), gt(passwordResetToken.expiresAt, new Date())))
  if (!row) throw apiError(400, 'This reset link is invalid or has expired.')

  const passwordHash = await hashAdminPassword(password)
  await db.update(adminUser).set({ passwordHash, failedAttempts: 0, lockedUntil: null }).where(eq(adminUser.id, row.userId))
  await db.update(passwordResetToken).set({ usedAt: new Date() }).where(eq(passwordResetToken.id, row.id))
  await db.update(adminSession).set({ revokedAt: new Date() }).where(and(eq(adminSession.userId, row.userId), isNull(adminSession.revokedAt)))
  await logActivity('system', 'security', 'admin_user', row.userId, 'Password reset via email link')
  return { ok: true }
})
