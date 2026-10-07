import { and, asc, desc, eq } from 'drizzle-orm'
import { blogCategory, blogPost, project, service, serviceCategory, skill, testimonial } from '../database/schema'

export default defineEventHandler(async () => {
  const db = useDb()
  const [services, projects, testimonials, posts, skills] = await Promise.all([
    db.select(serviceCardColumns).from(service).leftJoin(serviceCategory, eq(serviceCategory.id, service.categoryId))
      .where(and(publishedService(), eq(service.featured, true))).orderBy(asc(service.sortOrder)).limit(6),
    db.select(projectCardColumns).from(project)
      .where(and(publishedProject(), eq(project.featured, true))).orderBy(asc(project.sortOrder)).limit(4),
    db.select().from(testimonial).where(and(eq(testimonial.status, 'published'), eq(testimonial.featured, true))).orderBy(asc(testimonial.sortOrder)).limit(10),
    db.select(postCardColumns).from(blogPost).leftJoin(blogCategory, eq(blogCategory.id, blogPost.categoryId))
      .where(visiblePostWhere()).orderBy(desc(blogPost.publishedAt)).limit(3),
    db.select().from(skill).orderBy(asc(skill.sortOrder)).limit(40)
  ])
  return { services, projects, testimonials, posts, skills }
})
