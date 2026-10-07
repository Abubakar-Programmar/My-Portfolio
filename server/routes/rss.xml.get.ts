import { desc } from 'drizzle-orm'
import { blogPost } from '../database/schema'

export default defineEventHandler(async (event) => {
  const [settings, posts] = await Promise.all([
    getSettings(),
    useDb().select().from(blogPost).where(visiblePostWhere()).orderBy(desc(blogPost.publishedAt)).limit(30)
  ])
  const site = appUrl()
  const items = posts.map(p => `
    <item>
      <title>${escapeHtml(p.title)}</title>
      <link>${site}/blog/${p.slug}</link>
      <guid isPermaLink="true">${site}/blog/${p.slug}</guid>
      <pubDate>${(p.publishedAt ?? p.createdAt).toUTCString()}</pubDate>
      <description>${escapeHtml(p.excerpt)}</description>
    </item>`).join('')
  setResponseHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=600')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(settings.general.siteTitle)} — Blog</title>
    <link>${site}/blog</link>
    <description>${escapeHtml(settings.general.siteDescription)}</description>
    <language>en</language>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`
})
