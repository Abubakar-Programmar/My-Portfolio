import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { appendFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { count, eq } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { dbUrl } from './connection'
import { runMigrations } from './migrate'
import { hashPassword } from './password'
import * as s from './schema'
import * as data from './seed-data'
import { defaultSettings } from '../../shared/schemas/settings'
import { readingMinutes, slugify } from '../../shared/utils/text'

/**
 * Idempotent: every section is only seeded when its table is empty, so re-running
 * never duplicates or overwrites content you have edited. `--reset` wipes content first.
 */
async function main() {
  const reset = process.argv.includes('--reset')
  await runMigrations()
  const client = postgres(dbUrl(), { max: 1, onnotice: () => {} })
  const db = drizzle(client, { schema: s })

  const empty = async (table: PgTable) => {
    const [row] = await db.select({ n: count() }).from(table)
    return (row?.n ?? 0) === 0
  }

  if (reset) {
    console.log('[seed] --reset: clearing content tables')
    await client.unsafe(`TRUNCATE portfolio.blog_post_tag, portfolio.blog_post, portfolio.tag, portfolio.blog_category,
      portfolio.project, portfolio.service, portfolio.service_category, portfolio.testimonial, portfolio.skill,
      portfolio.experience, portfolio.education, portfolio.certification, portfolio.setting RESTART IDENTITY CASCADE`)
  }

  // ── Admin account ────────────────────────────────────────────────
  const envPath = resolve(process.cwd(), '.env')
  let adminEmail = process.env.ADMIN_EMAIL?.trim()
  let adminPassword = process.env.ADMIN_PASSWORD
  let generated = false
  if (!adminEmail) {
    adminEmail = (process.env.NOTIFY_EMAIL || process.env.MAIL_USERNAME || '').trim()
    if (!adminEmail.includes('@')) throw new Error('Set ADMIN_EMAIL in .env before seeding.')
    appendFileSync(envPath, `\nADMIN_EMAIL="${adminEmail}"\n`)
  }
  if (!adminPassword) {
    adminPassword = `${randomBytes(15).toString('base64url')}Aa1`
    appendFileSync(envPath, `ADMIN_PASSWORD="${adminPassword}"\n`)
    generated = true
  }
  const [existingAdmin] = await db.select().from(s.adminUser).where(eq(s.adminUser.email, adminEmail.toLowerCase()))
  if (!existingAdmin) {
    await db.insert(s.adminUser).values({
      email: adminEmail.toLowerCase(),
      name: defaultSettings.profile.name,
      passwordHash: await hashPassword(adminPassword)
    })
    console.log(`[seed] admin account created for ${adminEmail}`)
    if (generated) console.log(`[seed] generated ADMIN_PASSWORD and saved it to .env: ${adminPassword}`)
  } else {
    console.log('[seed] admin account already exists — password left unchanged')
  }

  // ── Settings ─────────────────────────────────────────────────────
  if (await empty(s.setting)) {
    const settings = structuredClone(defaultSettings)
    settings.contact.email = adminEmail.toLowerCase()
    settings.notifications.email = adminEmail.toLowerCase()
    settings.profile.bio = data.aboutBio
    settings.profile.photo = '/seed/portrait.svg'
    for (const [key, value] of Object.entries(settings)) {
      await db.insert(s.setting).values({ key, value: value as Record<string, unknown> })
    }
    console.log('[seed] settings')
  }

  // ── Services ─────────────────────────────────────────────────────
  if (await empty(s.service)) {
    const cats = await db.insert(s.serviceCategory).values(data.serviceCategories).returning()
    const catId = (slug: string) => cats.find(c => c.slug === slug)?.id ?? null
    for (const [i, v] of data.services.entries()) {
      await db.insert(s.service).values({
        slug: v.slug, title: v.title, summary: v.summary, overview: v.overview, icon: v.icon,
        coverImage: v.cover, images: v.images, deliverables: v.deliverables, processSteps: v.processSteps,
        tools: v.tools, showPricing: v.showPricing, startingPrice: v.startingPrice, packages: v.packages,
        turnaround: v.turnaround, faqs: v.faqs, seoTitle: v.seoTitle, seoDescription: v.seoDescription,
        status: 'published', featured: v.featured, sortOrder: i + 1, categoryId: catId(v.category)
      })
    }
    console.log(`[seed] ${data.services.length} services`)
  }

  // ── Projects ─────────────────────────────────────────────────────
  if (await empty(s.project)) {
    const svc = await db.select({ id: s.service.id, slug: s.service.slug }).from(s.service)
    for (const [i, p] of data.projects.entries()) {
      await db.insert(s.project).values({
        slug: p.slug, title: p.title, summary: p.summary, client: p.client, year: p.year,
        problem: p.problem, solution: p.solution, results: p.results, techStack: p.techStack,
        coverImage: p.cover, gallery: p.gallery, liveUrl: p.liveUrl, githubUrl: p.githubUrl,
        serviceId: svc.find(x => x.slug === p.service)?.id ?? null,
        seoTitle: p.title.slice(0, 70), seoDescription: p.summary.slice(0, 160),
        status: 'published', featured: p.featured, sortOrder: i + 1
      })
    }
    console.log(`[seed] ${data.projects.length} projects`)
  }

  // ── Blog ─────────────────────────────────────────────────────────
  if (await empty(s.blogPost)) {
    const cats = await db.insert(s.blogCategory).values(data.blogCategories).returning()
    for (const p of data.posts) {
      const [post] = await db.insert(s.blogPost).values({
        slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content, coverImage: p.cover,
        status: 'published', publishedAt: new Date(Date.now() - p.daysAgo * 86_400_000),
        readingMinutes: readingMinutes(p.content), featured: p.featured,
        categoryId: cats.find(c => c.slug === p.category)?.id ?? null,
        seoTitle: p.title.slice(0, 70), seoDescription: p.excerpt.slice(0, 160)
      }).returning()
      if (!post) continue
      for (const name of p.tags) {
        await db.insert(s.tag).values({ name, slug: slugify(name) }).onConflictDoNothing()
        const [t] = await db.select().from(s.tag).where(eq(s.tag.slug, slugify(name)))
        if (t) await db.insert(s.blogPostTag).values({ postId: post.id, tagId: t.id }).onConflictDoNothing()
      }
    }
    console.log(`[seed] ${data.posts.length} blog posts`)
  }

  // ── Profile content ──────────────────────────────────────────────
  if (await empty(s.testimonial)) {
    await db.insert(s.testimonial).values(data.testimonials.map((t, i) => ({ ...t, sortOrder: i + 1, featured: true, status: 'published' as const })))
    console.log('[seed] testimonials')
  }
  if (await empty(s.skill)) {
    await db.insert(s.skill).values(data.skills.map((k, i) => ({ ...k, sortOrder: i + 1 })))
    console.log('[seed] skills')
  }
  if (await empty(s.experience)) {
    await db.insert(s.experience).values(data.experiences.map((e, i) => ({ ...e, sortOrder: i + 1 })))
    await db.insert(s.education).values(data.educations.map((e, i) => ({ ...e, sortOrder: i + 1 })))
    await db.insert(s.certification).values(data.certifications.map((c, i) => ({ ...c, sortOrder: i + 1 })))
    console.log('[seed] experience, education, certifications')
  }

  if (await empty(s.notification)) {
    await db.insert(s.notification).values({
      type: 'message',
      title: 'Welcome to your dashboard',
      body: 'New contact messages will appear here in real time and be emailed to you.',
      link: '/admin/inbox'
    })
  }

  await client.end()
  console.log('[seed] done')
}

main().catch((err) => {
  console.error('[seed] failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
