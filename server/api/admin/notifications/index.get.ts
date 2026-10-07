import { count, desc, isNull } from 'drizzle-orm'
import { notification } from '../../../database/schema'

export default defineEventHandler(async () => {
  const db = useDb()
  const items = await db.select().from(notification).orderBy(desc(notification.createdAt)).limit(30)
  const [{ unread } = { unread: 0 }] = await db.select({ unread: count() }).from(notification).where(isNull(notification.readAt))
  return { items, unread }
})
