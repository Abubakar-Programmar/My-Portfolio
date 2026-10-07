import { and, asc, eq } from 'drizzle-orm'
import { project, service } from '../../database/schema'

export default defineEventHandler(async () => {
  const db = useDb()
  const items = await db
    .select({ ...projectCardColumns, serviceTitle: service.title, serviceSlug: service.slug })
    .from(project)
    .leftJoin(service, eq(service.id, project.serviceId))
    .where(and(publishedProject()))
    .orderBy(asc(project.sortOrder))
  return { items }
})
