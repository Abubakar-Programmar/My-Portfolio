import { and, asc, eq, ne } from 'drizzle-orm'
import { project, service, serviceCategory } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const db = useDb()
  const [row] = await db
    .select({ service, categoryName: serviceCategory.name, categorySlug: serviceCategory.slug })
    .from(service)
    .leftJoin(serviceCategory, eq(serviceCategory.id, service.categoryId))
    .where(and(eq(service.slug, slug), publishedService()))
  if (!row) throw apiError(404, 'Service not found')

  const [related, caseStudies] = await Promise.all([
    db.select(serviceCardColumns).from(service).leftJoin(serviceCategory, eq(serviceCategory.id, service.categoryId))
      .where(and(publishedService(), ne(service.id, row.service.id))).orderBy(asc(service.sortOrder)).limit(3),
    db.select(projectCardColumns).from(project).where(and(publishedProject(), eq(project.serviceId, row.service.id))).orderBy(asc(project.sortOrder)).limit(3)
  ])
  // Prices are not published on the website.
  const { showPricing: _showPricing, startingPrice: _startingPrice, packages: _packages, ...publicService } = row.service
  return { ...publicService, categoryName: row.categoryName, categorySlug: row.categorySlug, related, caseStudies }
})
