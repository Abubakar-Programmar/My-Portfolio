import { and, desc, eq, inArray, ne } from 'drizzle-orm'
import { blogCategory, blogPost, blogPostTag } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const db = useDb()
  const [row] = await db
    .select({ post: blogPost, categoryName: blogCategory.name, categorySlug: blogCategory.slug })
    .from(blogPost)
    .leftJoin(blogCategory, eq(blogCategory.id, blogPost.categoryId))
    .where(and(eq(blogPost.slug, slug), visiblePostWhere()))
  if (!row) throw apiError(404, 'Post not found')

  const post = (await withTags([row.post]))[0]!
  const { html, toc } = withHeadingIds(row.post.content)

  // Related: posts that share a tag, topped up with the newest posts.
  const tagIds = (await db.select({ id: blogPostTag.tagId }).from(blogPostTag).where(eq(blogPostTag.postId, row.post.id))).map(t => t.id)
  const sharedIds = tagIds.length
    ? (await db.select({ id: blogPostTag.postId }).from(blogPostTag).where(and(inArray(blogPostTag.tagId, tagIds), ne(blogPostTag.postId, row.post.id)))).map(r => r.id)
    : []
  let related = sharedIds.length
    ? await db.select(postCardColumns).from(blogPost).leftJoin(blogCategory, eq(blogCategory.id, blogPost.categoryId))
        .where(and(visiblePostWhere(), inArray(blogPost.id, [...new Set(sharedIds)]))).orderBy(desc(blogPost.publishedAt)).limit(3)
    : []
  if (related.length < 3) {
    const fill = await db.select(postCardColumns).from(blogPost).leftJoin(blogCategory, eq(blogCategory.id, blogPost.categoryId))
      .where(and(visiblePostWhere(), ne(blogPost.id, row.post.id))).orderBy(desc(blogPost.publishedAt)).limit(4)
    related = [...related, ...fill.filter(f => !related.some(r => r.id === f.id))].slice(0, 3)
  }

  return { ...post, content: html, toc, categoryName: row.categoryName, categorySlug: row.categorySlug, related }
})
