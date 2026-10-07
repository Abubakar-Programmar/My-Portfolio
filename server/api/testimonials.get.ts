import { asc, eq } from 'drizzle-orm'
import { testimonial } from '../database/schema'

export default defineEventHandler(() =>
  useDb().select().from(testimonial).where(eq(testimonial.status, 'published')).orderBy(asc(testimonial.sortOrder))
)
