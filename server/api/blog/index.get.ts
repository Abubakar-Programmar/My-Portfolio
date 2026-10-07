import { and, asc, count, desc, eq, ilike, inArray, or } from 'drizzle-orm'
import { z } from 'zod'
import { blogCategory, blogPost, blogPostTag, tag } from '../../database/schema'

const query = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().trim().max(120).optional(),
  tag: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(30).default(9)
})

export default defineEventHandler(async (event) => {
  const { q, category, tag: tagSlug, page, pageSize } = queryValid(event, query)
  const db = useDb()
  const like = q ? `%${q.replace(/[%_\\]/g, m => `\\${m}`)}%` : null

  let taggedIds: string[] | null = null
  if (tagSlug) {
    const rows = await db.select({ id: blogPostTag.postId }).from(blogPostTag).innerJoin(tag, eq(tag.id, blogPostTag.tagId)).where(eq(tag.slug, tagSlug))
    taggedIds = rows.map(r => r.id)
  }

  const where = and(
    visiblePostWhere(),
    category ? eq(blogCategory.slug, category) : undefined,
    taggedIds ? (taggedIds.length ? inArray(blogPost.id, taggedIds) : eq(blogPost.id, '00000000-0000-0000-0000-000000000000')) : undefined,
    like ? or(ilike(blogPost.title, like), ilike(blogPost.excerpt, like)) : undefined
  )

  const base = db.select({ total: count() }).from(blogPost).leftJoin(blogCategory, eq(blogCategory.id, blogPost.categoryId)).where(where)
  const [{ total } = { total: 0 }] = await base
  const items = await db
    .select(postCardColumns)
    .from(blogPost)
    .leftJoin(blogCategory, eq(blogCategory.id, blogPost.categoryId))
    .where(where)
    .orderBy(desc(blogPost.publishedAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  const [categories, tags] = await Promise.all([
    db.select().from(blogCategory).orderBy(asc(blogCategory.name)),
    db.select().from(tag).orderBy(asc(tag.name))
  ])
  return { items: await withTags(items), total, page, pageSize, categories, tags }
})
