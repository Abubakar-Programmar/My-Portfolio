import { count, desc, eq } from 'drizzle-orm'
import { emailLog } from '../../../database/schema'

export default defineEventHandler(async () => {
  const db = useDb()
  const items = await db.select().from(emailLog).orderBy(desc(emailLog.createdAt)).limit(50)
  const [{ failed } = { failed: 0 }] = await db.select({ failed: count() }).from(emailLog).where(eq(emailLog.status, 'failed'))
  return { items, failed, smtpConfigured: mailConfigured() }
})
