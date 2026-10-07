import { desc } from 'drizzle-orm'
import { message } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const filter = queryValid(event, messageFilterSchema)
  const rows = await useDb().select().from(message).where(messageWhere(filter)).orderBy(desc(message.createdAt))
  await logActivity(user.email, 'export', 'Message', null, `Exported ${rows.length} message(s) to CSV`)
  return sendCsv(event, 'messages.csv', toCsv(rows, ['createdAt', 'name', 'email', 'serviceName', 'budget', 'status', 'starred', 'body', 'notes']))
})
