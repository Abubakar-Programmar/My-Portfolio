import { eq } from 'drizzle-orm'
import { adminSession } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session.secure?.sid) {
    await useDb().update(adminSession).set({ revokedAt: new Date() }).where(eq(adminSession.id, session.secure.sid))
  }
  await clearUserSession(event)
  return { ok: true }
})
