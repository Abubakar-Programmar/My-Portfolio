import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const def = resourceFor(event)
  const id = parseInput(z.uuid(), getRouterParam(event, 'id'))
  const [row] = (await useDb().delete(def.table).where(eq(columnsOf(def).id!, id)).returning()) as Record<string, unknown>[]
  if (!row) throw apiError(404, `${def.label} not found`)
  await logActivity(admin.user.email, 'delete', def.label, id, `Deleted ${def.label.toLowerCase()} “${String(row[def.nameField])}”`)
  return { ok: true }
})
