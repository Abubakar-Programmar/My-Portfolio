import type { PgTable } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { blogPost, message, pageView, project, service, subscriber, testimonial } from '../../../database/schema'

const sources: Record<string, PgTable> = {
  messages: message,
  subscribers: subscriber,
  services: service,
  projects: project,
  posts: blogPost,
  testimonials: testimonial,
  'page-views': pageView
}

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const kind = getRouterParam(event, 'kind') ?? ''
  const table = Object.hasOwn(sources, kind) ? sources[kind] : undefined
  if (!table) throw apiError(404, 'Unknown export')
  const { format } = queryValid(event, z.object({ format: z.enum(['json', 'csv']).default('json') }))

  const rows = (await useDb().select().from(table)) as Record<string, unknown>[]
  await logActivity(user.email, 'export', 'Data', kind, `Exported ${rows.length} ${kind} as ${format.toUpperCase()}`)

  if (format === 'csv') {
    const flat = rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v && typeof v === 'object' && !(v instanceof Date) ? JSON.stringify(v) : v])))
    return sendCsv(event, `${kind}.csv`, toCsv(flat))
  }
  setResponseHeaders(event, { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="${kind}.json"` })
  return JSON.stringify(rows, null, 2)
})
