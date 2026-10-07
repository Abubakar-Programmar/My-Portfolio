import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { message } from '../../../database/schema'
import { messageUpdateSchema } from '../../../../shared/schemas/contact'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = parseInput(z.uuid(), getRouterParam(event, 'id'))
  const patch = await readValid(event, messageUpdateSchema)
  const [row] = await useDb()
    .update(message)
    .set({ ...patch, notes: patch.notes === undefined ? undefined : patch.notes || null })
    .where(eq(message.id, id))
    .returning()
  if (!row) throw apiError(404, 'Message not found')
  await logActivity(user.email, 'update', 'Message', id, `Updated message from ${row.name}`)
  return row
})
