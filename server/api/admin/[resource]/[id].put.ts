import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const def = resourceFor(event)
  const id = parseInput(z.uuid(), getRouterParam(event, 'id'))
  const idCol = columnsOf(def).id!
  const db = useDb()
  const [existing] = (await db.select().from(def.table).where(eq(idCol, id))) as Record<string, unknown>[]
  if (!existing) throw apiError(404, `${def.label} not found`)

  const { values, input } = await buildValues(def, await readBody(event), existing)
  const [row] = (await db.update(def.table).set(values as never).where(eq(idCol, id)).returning()) as Record<string, unknown>[]
  if (!row) throw apiError(404, `${def.label} not found`)
  if (def.afterSave) await def.afterSave(row, input)
  await logActivity(admin.user.email, 'update', def.label, id, `Updated ${def.label.toLowerCase()} “${String(row[def.nameField])}”`)
  return def.decorate ? def.decorate(row) : row
})
