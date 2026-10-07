import { eq } from 'drizzle-orm'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const def = resourceFor(event)
  const id = parseInput(z.uuid(), getRouterParam(event, 'id'))
  const [row] = (await useDb().select().from(def.table).where(eq(columnsOf(def).id!, id))) as Record<string, unknown>[]
  if (!row) throw apiError(404, `${def.label} not found`)
  return def.decorate ? def.decorate(row) : row
})
