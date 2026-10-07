import { and, count, desc, ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { mediaAsset } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { q, page, pageSize, kind } = queryValid(event, z.object({
    q: z.string().trim().max(100).optional(),
    kind: z.enum(['image', 'pdf']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(36)
  }))
  const like = q ? `%${q.replace(/[%_\\]/g, m => `\\${m}`)}%` : null
  const filters = [
    like ? or(ilike(mediaAsset.originalName, like), ilike(mediaAsset.alt, like)) : undefined,
    kind === 'pdf' ? ilike(mediaAsset.mime, 'application/pdf') : kind === 'image' ? ilike(mediaAsset.mime, 'image/%') : undefined
  ].filter((f): f is NonNullable<typeof f> => Boolean(f))
  const where = filters.length ? and(...filters) : undefined

  const db = useDb()
  const [{ total } = { total: 0 }] = await db.select({ total: count() }).from(mediaAsset).where(where)
  const items = await db.select().from(mediaAsset).where(where).orderBy(desc(mediaAsset.createdAt)).limit(pageSize).offset((page - 1) * pageSize)
  return { items: items.map(i => ({ ...i, url: `/media/${i.filename}` })), total, page, pageSize }
})
