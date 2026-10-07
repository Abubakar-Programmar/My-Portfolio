import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { message, messageReply, service } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const id = parseInput(z.uuid(), getRouterParam(event, 'id'))
  const db = useDb()
  const [row] = await db.select().from(message).where(eq(message.id, id))
  if (!row) throw apiError(404, 'Message not found')

  // Opening an unread message marks it as read.
  if (row.status === 'unread') {
    await db.update(message).set({ status: 'read' }).where(eq(message.id, id))
    row.status = 'read'
  }
  const replies = await db.select().from(messageReply).where(eq(messageReply.messageId, id)).orderBy(asc(messageReply.createdAt))
  const [svc] = row.serviceId
    ? await db.select({ id: service.id, title: service.title, slug: service.slug }).from(service).where(eq(service.id, row.serviceId))
    : []
  return { ...row, replies, service: svc ?? null }
})
