import { blogPost, project, service } from '../../database/schema'
import { eq } from 'drizzle-orm'

// Dynamic URLs for @nuxtjs/sitemap, built from published content only.
export default defineEventHandler(async () => {
  const db = useDb()
  const [services, projects, posts] = await Promise.all([
    db.select({ slug: service.slug, updatedAt: service.updatedAt }).from(service).where(eq(service.status, 'published')),
    db.select({ slug: project.slug, updatedAt: project.updatedAt }).from(project).where(eq(project.status, 'published')),
    db.select({ slug: blogPost.slug, updatedAt: blogPost.updatedAt }).from(blogPost).where(visiblePostWhere())
  ])
  return [
    ...services.map(s => ({ loc: `/services/${s.slug}`, lastmod: s.updatedAt, priority: 0.8 })),
    ...projects.map(p => ({ loc: `/projects/${p.slug}`, lastmod: p.updatedAt, priority: 0.7 })),
    ...posts.map(p => ({ loc: `/blog/${p.slug}`, lastmod: p.updatedAt, priority: 0.6 }))
  ]
})
