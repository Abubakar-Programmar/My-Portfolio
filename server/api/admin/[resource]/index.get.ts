import { and, count, eq, ilike, or, type SQL } from 'drizzle-orm'
import { z } from 'zod'

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.string().trim().max(20).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
})

export default defineEventHandler(async (event) => {
  const def = resourceFor(event)
  const { q, status, page, pageSize } = queryValid(event, querySchema)
  const cols = columnsOf(def)
  const conditions: SQL[] = []
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, m => `\\${m}`)}%`
    const searchable = [cols[def.nameField]!, cols.slug].filter(Boolean)
    const clause = or(...searchable.map(c => ilike(c!, like)))
    if (clause) conditions.push(clause)
  }
  if (status && def.hasStatus && cols.status) conditions.push(eq(cols.status, status))
  const where = conditions.length ? and(...conditions) : undefined

  const db = useDb()
  const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(def.table).where(where)
  const items = await db
    .select()
    .from(def.table)
    .where(where)
    .orderBy(...def.order(cols))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
  return { items, total, page, pageSize }
})
