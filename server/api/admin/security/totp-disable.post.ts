import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { adminUser } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const { password } = await readValid(event, z.object({ password: z.string().min(1).max(128) }))
  const db = useDb()
  const [row] = await db.select().from(adminUser).where(eq(adminUser.id, user.id))
  if (!row || !(await verifyAdminPassword(row.passwordHash, password))) throw apiError(400, 'Incorrect password.', { password: 'Incorrect password' })
  await db.update(adminUser).set({ totpEnabled: false, totpSecret: null }).where(eq(adminUser.id, user.id))
  await logActivity(user.email, 'security', 'admin_user', user.id, 'Disabled two-factor authentication')
  return { ok: true }
})
