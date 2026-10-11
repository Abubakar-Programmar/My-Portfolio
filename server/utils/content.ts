import { and, eq, inArray, lte } from 'drizzle-orm'
import {
  blogCategory, blogPost, blogPostTag, project, service, serviceCategory, tag
} from '../database/schema'

/** Public visibility for posts: published, or scheduled with a publish date that has arrived. */
export function visiblePostWhere() {
  return and(inArray(blogPost.status, ['published', 'scheduled']), lte(blogPost.publishedAt, new Date()))
}

export const publishedService = () => eq(service.status, 'published')
export const publishedProject = () => eq(project.status, 'published')

/** Columns for list/card views — excludes the heavy rich-text fields. */
export const postCardColumns = {
  id: blogPost.id,
  slug: blogPost.slug,
  title: blogPost.title,
  excerpt: blogPost.excerpt,
  coverImage: blogPost.coverImage,
  publishedAt: blogPost.publishedAt,
  readingMinutes: blogPost.readingMinutes,
  featured: blogPost.featured,
  categoryId: blogPost.categoryId,
  categoryName: blogCategory.name,
  categorySlug: blogCategory.slug
}

export const serviceCardColumns = {
  id: service.id,
  slug: service.slug,
  title: service.title,
  summary: service.summary,
  icon: service.icon,
  coverImage: service.coverImage,
  turnaround: service.turnaround,
  featured: service.featured,
  categoryId: service.categoryId,
  categoryName: serviceCategory.name,
  categorySlug: serviceCategory.slug
}

export const projectCardColumns = {
  id: project.id,
  slug: project.slug,
  title: project.title,
  summary: project.summary,
  client: project.client,
  year: project.year,
  coverImage: project.coverImage,
  techStack: project.techStack,
  featured: project.featured,
  serviceId: project.serviceId
}

/** Attaches tag names to a list of posts in one query. */
export async function withTags<T extends { id: string }>(posts: T[]): Promise<(T & { tags: { name: string; slug: string }[] })[]> {
  if (!posts.length) return []
  const rows = await useDb()
    .select({ postId: blogPostTag.postId, name: tag.name, slug: tag.slug })
    .from(blogPostTag)
    .innerJoin(tag, eq(tag.id, blogPostTag.tagId))
    .where(inArray(blogPostTag.postId, posts.map(p => p.id)))
  return posts.map(p => ({ ...p, tags: rows.filter(r => r.postId === p.id).map(r => ({ name: r.name, slug: r.slug })) }))
}
