import { and, eq, isNull, ne } from 'drizzle-orm'
import { adminSession, adminUser } from '../../../database/schema'
import { changePasswordSchema } from '../../../../shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const { user, sid } = await requireAdmin(event)
  const { currentPassword, newPassword } = await readValid(event, changePasswordSchema)
  const db = useDb()
  const [row] = await db.select().from(adminUser).where(eq(adminUser.id, user.id))
  if (!row || !(await verifyAdminPassword(row.passwordHash, currentPassword))) {
    throw apiError(400, 'Your current password is incorrect.', { currentPassword: 'Incorrect password' })
  }
  if (newPassword === currentPassword) {
    throw apiError(400, 'Your new password must be different from the current one.', { newPassword: 'Choose a password you have not used before' })
  }
  await db.update(adminUser).set({ passwordHash: await hashAdminPassword(newPassword) }).where(eq(adminUser.id, user.id))
  // Sign out every other device.
  await db.update(adminSession).set({ revokedAt: new Date() }).where(and(eq(adminSession.userId, user.id), ne(adminSession.id, sid), isNull(adminSession.revokedAt)))
  await logActivity(user.email, 'security', 'admin_user', user.id, 'Changed password')
  return { ok: true }
})
