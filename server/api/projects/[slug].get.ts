import { and, asc, eq, ne } from 'drizzle-orm'
import { project, service } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const db = useDb()
  const [row] = await db
    .select({ project, serviceTitle: service.title, serviceSlug: service.slug })
    .from(project)
    .leftJoin(service, eq(service.id, project.serviceId))
    .where(and(eq(project.slug, slug), publishedProject()))
  if (!row) throw apiError(404, 'Project not found')

  const more = await db.select(projectCardColumns).from(project)
    .where(and(publishedProject(), ne(project.id, row.project.id))).orderBy(asc(project.sortOrder)).limit(2)
  return { ...row.project, serviceTitle: row.serviceTitle, serviceSlug: row.serviceSlug, more }
})
