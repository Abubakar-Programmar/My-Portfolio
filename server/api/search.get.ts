import { and, ilike } from 'drizzle-orm'
import { z } from 'zod'
import { blogPost, project, service } from '../database/schema'

// Powers the Ctrl+K command palette: published content only.
export default defineEventHandler(async (event) => {
  const { q } = queryValid(event, z.object({ q: z.string().trim().min(2).max(60) }))
  const like = `%${q.replace(/[%_\\]/g, m => `\\${m}`)}%`
  const db = useDb()
  const [services, projects, posts] = await Promise.all([
    db.select({ title: service.title, slug: service.slug }).from(service).where(and(publishedService(), ilike(service.title, like))).limit(4),
    db.select({ title: project.title, slug: project.slug }).from(project).where(and(publishedProject(), ilike(project.title, like))).limit(4),
    db.select({ title: blogPost.title, slug: blogPost.slug }).from(blogPost).where(and(visiblePostWhere(), ilike(blogPost.title, like))).limit(4)
  ])
  return [
    ...services.map(s => ({ group: 'Services', label: s.title, to: `/services/${s.slug}` })),
    ...projects.map(s => ({ group: 'Projects', label: s.title, to: `/projects/${s.slug}` })),
    ...posts.map(s => ({ group: 'Blog', label: s.title, to: `/blog/${s.slug}` }))
  ]
})
