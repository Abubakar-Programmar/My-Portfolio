import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { message } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = parseInput(z.uuid(), getRouterParam(event, 'id'))
  const [row] = await useDb().delete(message).where(eq(message.id, id)).returning()
  if (!row) throw apiError(404, 'Message not found')
  await logActivity(user.email, 'delete', 'Message', id, `Deleted message from ${row.name}`)
  return { ok: true }
})
