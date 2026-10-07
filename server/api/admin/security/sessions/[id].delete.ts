import { and, eq } from 'drizzle-orm'
import { adminSession } from '../../../../database/schema'

export default defineEventHandler(async (event) => {
  const { user, sid } = await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const result = await useDb()
    .update(adminSession)
    .set({ revokedAt: new Date() })
    .where(and(eq(adminSession.id, id), eq(adminSession.userId, user.id)))
    .returning({ id: adminSession.id })
  if (!result.length) throw apiError(404, 'Session not found')
  if (id === sid) await clearUserSession(event)
  await logActivity(user.email, 'security', 'session', id, 'Revoked a session')
  return { ok: true }
})
