import { eq } from 'drizzle-orm'
import { adminUser } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const [row] = await useDb().select({ totpEnabled: adminUser.totpEnabled }).from(adminUser).where(eq(adminUser.id, user.id))
  return { ...user, totpEnabled: row?.totpEnabled ?? false }
})
