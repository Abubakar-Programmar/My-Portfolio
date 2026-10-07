import { count, desc, eq, inArray } from 'drizzle-orm'
import { message } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const filter = queryValid(event, messageFilterSchema)
  const db = useDb()
  const where = messageWhere(filter)
  const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(message).where(where)
  const items = await db
    .select()
    .from(message)
    .where(where)
    .orderBy(desc(message.createdAt))
    .limit(filter.pageSize)
    .offset((filter.page - 1) * filter.pageSize)

  const [{ unread } = { unread: 0 }] = await db.select({ unread: count() }).from(message).where(eq(message.status, 'unread'))
  const [{ starred } = { starred: 0 }] = await db.select({ starred: count() }).from(message).where(eq(message.starred, true))
  const [{ archived } = { archived: 0 }] = await db.select({ archived: count() }).from(message).where(eq(message.status, 'archived'))
  const [{ spam } = { spam: 0 }] = await db.select({ spam: count() }).from(message).where(eq(message.status, 'spam'))
  const [{ inbox } = { inbox: 0 }] = await db.select({ inbox: count() }).from(message).where(inArray(message.status, ['unread', 'read']))

  return { items, total, page: filter.page, pageSize: filter.pageSize, counts: { inbox, unread, starred, archived, spam } }
})
