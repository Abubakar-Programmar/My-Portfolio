import { and, asc, desc, eq, inArray, ne, getTableColumns, type SQL } from 'drizzle-orm'
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'
import type { H3Event } from 'h3'
import type { z } from 'zod'
import {
  blogCategory, blogPost, blogPostTag, certification, education, experience, project, service,
  serviceCategory, skill, tag, testimonial
} from '../database/schema'
import {
  blogCategoryInput, certificationInput, educationInput, experienceInput, postInput, projectInput,
  serviceCategoryInput, serviceInput, skillInput, tagInput, testimonialInput
} from '../../shared/schemas/content'
import { readingMinutes, slugify } from '../../shared/utils/text'
import { sanitizeRichText } from './sanitize'

type Row = Record<string, unknown>

export interface ResourceDef {
  label: string
  table: PgTable
  schema: z.ZodType
  /** Column used for search, slug generation and activity summaries. */
  nameField: string
  slugged: boolean
  hasStatus: boolean
  htmlFields: string[]
  order: (cols: Record<string, PgColumn>) => SQL[]
  prepare?: (data: Row, existing: Row | null) => Row
  afterSave?: (row: Row, input: Row) => Promise<void>
  decorate?: (row: Row) => Promise<Row>
}

async function savePostTags(postId: string, names: string[]) {
  const db = useDb()
  await db.delete(blogPostTag).where(eq(blogPostTag.postId, postId))
  const unique = [...new Map(names.map(n => [slugify(n), n.trim()])).entries()].filter(([s]) => s)
  if (!unique.length) return
  await db.insert(tag).values(unique.map(([slug, name]) => ({ slug, name }))).onConflictDoNothing()
  const tags = await db.select().from(tag).where(inArray(tag.slug, unique.map(([s]) => s)))
  await db.insert(blogPostTag).values(tags.map(t => ({ postId, tagId: t.id })))
}

export const resources: Record<string, ResourceDef> = {
  services: {
    label: 'Service', table: service, schema: serviceInput, nameField: 'title', slugged: true, hasStatus: true,
    htmlFields: ['overview'],
    order: c => [asc(c.sortOrder!), desc(c.createdAt!)]
  },
  projects: {
    label: 'Project', table: project, schema: projectInput, nameField: 'title', slugged: true, hasStatus: true,
    htmlFields: ['problem', 'solution'],
    order: c => [asc(c.sortOrder!), desc(c.createdAt!)]
  },
  posts: {
    label: 'Blog post', table: blogPost, schema: postInput, nameField: 'title', slugged: true, hasStatus: true,
    htmlFields: ['content'],
    order: c => [desc(c.createdAt!)],
    prepare: (data, existing) => {
      const status = data.status as string
      let publishedAt = (data.publishedAt as Date | null) ?? (existing?.publishedAt as Date | null) ?? null
      if (status === 'published' && !publishedAt) publishedAt = new Date()
      if (status === 'scheduled') {
        if (!publishedAt) throw apiError(422, 'Choose a publish date for a scheduled post.', { publishedAt: 'Required for scheduled posts' })
      }
      const { tags: _tags, ...rest } = data
      return { ...rest, publishedAt, readingMinutes: readingMinutes(String(data.content ?? '')) }
    },
    afterSave: async (row, input) => savePostTags(String(row.id), (input.tags as string[]) ?? []),
    decorate: async (row) => {
      const tags = await useDb()
        .select({ name: tag.name })
        .from(blogPostTag)
        .innerJoin(tag, eq(tag.id, blogPostTag.tagId))
        .where(eq(blogPostTag.postId, String(row.id)))
      return { ...row, tags: tags.map(t => t.name) }
    }
  },
  testimonials: {
    label: 'Testimonial', table: testimonial, schema: testimonialInput, nameField: 'name', slugged: false, hasStatus: true,
    htmlFields: [], order: c => [asc(c.sortOrder!), desc(c.createdAt!)]
  },
  skills: {
    label: 'Skill', table: skill, schema: skillInput, nameField: 'name', slugged: false, hasStatus: false,
    htmlFields: [], order: c => [asc(c.category!), asc(c.sortOrder!)]
  },
  experience: {
    label: 'Experience', table: experience, schema: experienceInput, nameField: 'role', slugged: false, hasStatus: false,
    htmlFields: [], order: c => [asc(c.sortOrder!), desc(c.createdAt!)]
  },
  education: {
    label: 'Education', table: education, schema: educationInput, nameField: 'degree', slugged: false, hasStatus: false,
    htmlFields: [], order: c => [asc(c.sortOrder!), desc(c.createdAt!)]
  },
  certifications: {
    label: 'Certification', table: certification, schema: certificationInput, nameField: 'name', slugged: false, hasStatus: false,
    htmlFields: [], order: c => [asc(c.sortOrder!), desc(c.createdAt!)]
  },
  'service-categories': {
    label: 'Service category', table: serviceCategory, schema: serviceCategoryInput, nameField: 'name', slugged: true, hasStatus: false,
    htmlFields: [], order: c => [asc(c.sortOrder!), asc(c.name!)]
  },
  'blog-categories': {
    label: 'Blog category', table: blogCategory, schema: blogCategoryInput, nameField: 'name', slugged: true, hasStatus: false,
    htmlFields: [], order: c => [asc(c.name!)]
  },
  tags: {
    label: 'Tag', table: tag, schema: tagInput, nameField: 'name', slugged: true, hasStatus: false,
    htmlFields: [], order: c => [asc(c.name!)]
  }
}

export function resourceFor(event: H3Event): ResourceDef {
  const key = getRouterParam(event, 'resource') ?? ''
  const def = Object.hasOwn(resources, key) ? resources[key] : undefined
  if (!def) throw apiError(404, 'Unknown resource')
  return def
}

export function columnsOf(def: ResourceDef) {
  return getTableColumns(def.table) as Record<string, PgColumn>
}

/** Returns a slug unique within the table, appending -2, -3… when needed. */
export async function uniqueSlug(def: ResourceDef, wanted: string, excludeId?: string): Promise<string> {
  const cols = columnsOf(def)
  const base = slugify(wanted) || 'item'
  for (let n = 1; n < 200; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`
    const conditions = [eq(cols.slug!, candidate)]
    if (excludeId) conditions.push(ne(cols.id!, excludeId))
    const [hit] = await useDb().select({ id: cols.id! }).from(def.table).where(and(...conditions)).limit(1)
    if (!hit) return candidate
  }
  throw apiError(409, 'Could not generate a unique slug')
}

/** Validates input, sanitises rich text, resolves the slug and applies resource-specific rules. */
export async function buildValues(def: ResourceDef, raw: unknown, existing: Row | null): Promise<{ values: Row; input: Row }> {
  const input = parseInput(def.schema, raw) as Row
  let values: Row = { ...input }
  for (const field of def.htmlFields) values[field] = sanitizeRichText(String(values[field] ?? ''))
  if (def.slugged) {
    const wanted = (values.slug as string | undefined) || String(values[def.nameField] ?? '')
    values.slug = await uniqueSlug(def, wanted, existing ? String(existing.id) : undefined)
  }
  if (def.prepare) values = def.prepare(values, existing)
  return { values, input }
}
