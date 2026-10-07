import { inArray } from 'drizzle-orm'
import { message } from '../../../database/schema'
import { messageBulkSchema } from '../../../../shared/schemas/contact'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const { ids, action } = await readValid(event, messageBulkSchema)
  const db = useDb()
  const where = inArray(message.id, ids)
  switch (action) {
    case 'read': await db.update(message).set({ status: 'read' }).where(where); break
    case 'unread': await db.update(message).set({ status: 'unread' }).where(where); break
    case 'archive': await db.update(message).set({ status: 'archived' }).where(where); break
    case 'spam': await db.update(message).set({ status: 'spam' }).where(where); break
    case 'star': await db.update(message).set({ starred: true }).where(where); break
    case 'unstar': await db.update(message).set({ starred: false }).where(where); break
    case 'delete': await db.delete(message).where(where); break
  }
  await logActivity(user.email, action === 'delete' ? 'delete' : 'update', 'Message', null, `Bulk “${action}” on ${ids.length} message(s)`)
  return { ok: true, count: ids.length }
})
