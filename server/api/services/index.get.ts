import { and, asc, desc, eq, ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { service, serviceCategory } from '../../database/schema'

const query = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().trim().max(120).optional(),
  sort: z.enum(['featured', 'newest', 'name']).default('featured')
})

export default defineEventHandler(async (event) => {
  const { q, category, sort } = queryValid(event, query)
  const db = useDb()
  const like = q ? `%${q.replace(/[%_\\]/g, m => `\\${m}`)}%` : null
  const where = and(
    publishedService(),
    category ? eq(serviceCategory.slug, category) : undefined,
    like ? or(ilike(service.title, like), ilike(service.summary, like)) : undefined
  )
  const order = sort === 'name' ? [asc(service.title)] : sort === 'newest' ? [desc(service.createdAt)] : [desc(service.featured), asc(service.sortOrder)]

  const [items, categories] = await Promise.all([
    db.select(serviceCardColumns).from(service).leftJoin(serviceCategory, eq(serviceCategory.id, service.categoryId)).where(where).orderBy(...order),
    db.select().from(serviceCategory).orderBy(asc(serviceCategory.sortOrder))
  ])
  return { items, categories }
})
