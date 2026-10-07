import { and, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { notification } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { id } = await readValid(event, z.object({ id: z.uuid().optional() }))
  const where = id ? and(eq(notification.id, id), isNull(notification.readAt)) : isNull(notification.readAt)
  await useDb().update(notification).set({ readAt: new Date() }).where(where)
  return { ok: true }
})
