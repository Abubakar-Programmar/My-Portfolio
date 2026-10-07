import { and, eq, gte, ilike, inArray, lte, or, type SQL } from 'drizzle-orm'
import { z } from 'zod'
import { message } from '../database/schema'

export const messageFilterSchema = z.object({
  view: z.enum(['inbox', 'unread', 'read', 'starred', 'archived', 'spam', 'all']).default('inbox'),
  q: z.string().trim().max(100).optional(),
  service: z.string().trim().max(100).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
})

export type MessageFilter = z.infer<typeof messageFilterSchema>

/** Translates inbox filters (shared by the list view and CSV export) into a SQL condition. */
export function messageWhere(f: MessageFilter): SQL | undefined {
  const c: (SQL | undefined)[] = []
  switch (f.view) {
    case 'inbox': c.push(inArray(message.status, ['unread', 'read'])); break
    case 'starred': c.push(eq(message.starred, true), inArray(message.status, ['unread', 'read', 'archived'])); break
    case 'all': break
    default: c.push(eq(message.status, f.view))
  }
  if (f.q) {
    const like = `%${f.q.replace(/[%_\\]/g, m => `\\${m}`)}%`
    c.push(or(ilike(message.name, like), ilike(message.email, like), ilike(message.body, like)))
  }
  if (f.service) c.push(eq(message.serviceId, f.service))
  if (f.from && !Number.isNaN(Date.parse(f.from))) c.push(gte(message.createdAt, new Date(f.from)))
  if (f.to && !Number.isNaN(Date.parse(f.to))) c.push(lte(message.createdAt, new Date(`${f.to}T23:59:59.999Z`)))
  const defined = c.filter((x): x is SQL => Boolean(x))
  return defined.length ? and(...defined) : undefined
}
