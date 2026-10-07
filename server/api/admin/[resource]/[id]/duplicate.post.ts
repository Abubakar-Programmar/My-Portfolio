import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const def = resourceFor(event)
  const id = parseInput(z.uuid(), getRouterParam(event, 'id'))
  const db = useDb()
  let [source] = (await db.select().from(def.table).where(eq(columnsOf(def).id!, id))) as Record<string, unknown>[]
  if (!source) throw apiError(404, `${def.label} not found`)
  if (def.decorate) source = await def.decorate(source)

  // Re-run the full pipeline on a copy so the duplicate gets a fresh unique slug and draft state.
  const copy: Record<string, unknown> = { ...source, [def.nameField]: `${String(source[def.nameField])} (copy)`, slug: '' }
  if (def.hasStatus) copy.status = 'draft'
  if ('featured' in copy) copy.featured = false
  if ('publishedAt' in copy) copy.publishedAt = null
  const { values, input } = await buildValues(def, copy, null)
  const [row] = (await db.insert(def.table).values(values as never).returning()) as Record<string, unknown>[]
  if (!row) throw apiError(500, 'Could not duplicate the record')
  if (def.afterSave) await def.afterSave(row, input)
  await logActivity(admin.user.email, 'duplicate', def.label, String(row.id), `Duplicated ${def.label.toLowerCase()} “${String(source[def.nameField])}”`)
  setResponseStatus(event, 201)
  return row
})
