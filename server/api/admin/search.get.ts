import { ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { blogPost, message, project, service, testimonial } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { q } = queryValid(event, z.object({ q: z.string().trim().min(2).max(80) }))
  const like = `%${q.replace(/[%_\\]/g, m => `\\${m}`)}%`
  const db = useDb()
  const [services, projects, posts, messages, testimonials] = await Promise.all([
    db.select({ id: service.id, title: service.title }).from(service).where(ilike(service.title, like)).limit(5),
    db.select({ id: project.id, title: project.title }).from(project).where(ilike(project.title, like)).limit(5),
    db.select({ id: blogPost.id, title: blogPost.title }).from(blogPost).where(ilike(blogPost.title, like)).limit(5),
    db.select({ id: message.id, name: message.name, email: message.email }).from(message).where(or(ilike(message.name, like), ilike(message.email, like), ilike(message.body, like))).limit(5),
    db.select({ id: testimonial.id, name: testimonial.name }).from(testimonial).where(ilike(testimonial.name, like)).limit(5)
  ])
  return [
    ...services.map(s => ({ group: 'Services', label: s.title, to: `/admin/services/${s.id}` })),
    ...projects.map(s => ({ group: 'Projects', label: s.title, to: `/admin/projects/${s.id}` })),
    ...posts.map(s => ({ group: 'Blog', label: s.title, to: `/admin/blog/${s.id}` })),
    ...messages.map(s => ({ group: 'Inbox', label: `${s.name} <${s.email}>`, to: `/admin/inbox/${s.id}` })),
    ...testimonials.map(s => ({ group: 'Testimonials', label: s.name, to: `/admin/testimonials/${s.id}` }))
  ]
})
