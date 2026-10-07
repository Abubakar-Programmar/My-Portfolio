import { count, desc } from 'drizzle-orm'
import { z } from 'zod'
import { activityLog } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { page, pageSize } = queryValid(event, z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(30)
  }))
  const db = useDb()
  const items = await db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(pageSize).offset((page - 1) * pageSize)
  const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(activityLog)
  return { items, total, page, pageSize }
})
