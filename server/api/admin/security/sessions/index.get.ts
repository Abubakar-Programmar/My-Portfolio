import { and, desc, eq, isNull } from 'drizzle-orm'
import { adminSession } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const { user, sid } = await requireAdmin(event)
  const rows = await useDb()
    .select()
    .from(adminSession)
    .where(and(eq(adminSession.userId, user.id), isNull(adminSession.revokedAt)))
    .orderBy(desc(adminSession.lastSeenAt))
  return rows.map(r => ({ id: r.id, ip: r.ip, userAgent: r.userAgent, createdAt: r.createdAt, lastSeenAt: r.lastSeenAt, current: r.id === sid }))
})
