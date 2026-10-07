export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const def = resourceFor(event)
  const { values, input } = await buildValues(def, await readBody(event), null)
  const [row] = (await useDb().insert(def.table).values(values as never).returning()) as Record<string, unknown>[]
  if (!row) throw apiError(500, 'Could not create the record')
  if (def.afterSave) await def.afterSave(row, input)
  await logActivity(admin.user.email, 'create', def.label, String(row.id), `Created ${def.label.toLowerCase()} “${String(row[def.nameField])}”`)
  setResponseStatus(event, 201)
  return def.decorate ? def.decorate(row) : row
})
