import { z } from 'zod'

// Shared by admin forms (client) and admin API routes (server).

const text = (max: number) => z.string().trim().max(max)
const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform(v => (v ? v : null))
const optUrl = z
  .string()
  .trim()
  .max(500)
  .nullish()
  .refine(v => !v || /^https?:\/\//i.test(v), 'Must start with http:// or https://')
  .transform(v => (v ? v : null))
const optId = z
  .string()
  .nullish()
  .transform(v => (v ? v : null))
  .pipe(z.uuid().nullable())
const mediaPath = z
  .string()
  .trim()
  .max(500)
  .nullish()
  .refine(v => !v || v.startsWith('/') || /^https?:\/\//i.test(v), 'Invalid image path')
  .transform(v => (v ? v : null))
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens')
  .or(z.literal(''))
  .optional()
const stringList = z.array(text(300).min(1)).max(60).default([])

export const publishStatus = z.enum(['draft', 'published'])
export const postStatus = z.enum(['draft', 'scheduled', 'published'])

export const serviceInput = z.object({
  slug,
  title: text(160).min(2, 'Title is required'),
  summary: text(400).default(''),
  overview: text(40000).default(''),
  icon: text(40).default('code'),
  coverImage: mediaPath,
  images: z.array(z.string().max(500)).max(20).default([]),
  deliverables: stringList,
  processSteps: z
    .array(z.object({ title: text(120).min(1), description: text(600).default('') }))
    .max(20)
    .default([]),
  tools: stringList,
  showPricing: z.boolean().default(false),
  startingPrice: optText(60),
  packages: z
    .array(
      z.object({
        name: text(80).min(1),
        price: text(60).min(1),
        description: text(300).default(''),
        features: stringList
      })
    )
    .max(6)
    .default([]),
  turnaround: optText(80),
  faqs: z
    .array(z.object({ question: text(240).min(1), answer: text(1500).min(1) }))
    .max(20)
    .default([]),
  seoTitle: optText(70),
  seoDescription: optText(170),
  status: publishStatus.default('draft'),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  categoryId: optId
})

export const projectInput = z.object({
  slug,
  title: text(160).min(2, 'Title is required'),
  summary: text(400).default(''),
  client: optText(120),
  year: z.coerce.number().int().min(1990).max(2100).nullish().transform(v => v ?? null),
  problem: text(40000).default(''),
  solution: text(40000).default(''),
  results: z
    .array(z.object({ label: text(80).min(1), before: text(40).default(''), after: text(40).min(1) }))
    .max(12)
    .default([]),
  techStack: stringList,
  coverImage: mediaPath,
  gallery: z.array(z.string().max(500)).max(20).default([]),
  liveUrl: optUrl,
  githubUrl: optUrl,
  serviceId: optId,
  seoTitle: optText(70),
  seoDescription: optText(170),
  status: publishStatus.default('draft'),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
})

export const postInput = z.object({
  slug,
  title: text(180).min(2, 'Title is required'),
  excerpt: text(400).default(''),
  content: text(200000).default(''),
  coverImage: mediaPath,
  status: postStatus.default('draft'),
  publishedAt: z
    .string()
    .nullish()
    .transform(v => (v ? new Date(v) : null))
    .refine(v => !v || !Number.isNaN(v.getTime()), 'Invalid date'),
  featured: z.boolean().default(false),
  categoryId: optId,
  tags: z.array(text(40).min(1)).max(12).default([]),
  seoTitle: optText(70),
  seoDescription: optText(170)
})

export const testimonialInput = z.object({
  name: text(120).min(2, 'Name is required'),
  role: optText(120),
  company: optText(120),
  quote: text(1200).min(10, 'Quote is required'),
  avatar: mediaPath,
  rating: z.coerce.number().int().min(1).max(5).default(5),
  featured: z.boolean().default(true),
  status: publishStatus.default('published'),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
})

export const skillInput = z.object({
  name: text(80).min(1, 'Name is required'),
  category: text(80).min(1, 'Category is required'),
  level: z.coerce.number().int().min(0).max(100).default(80),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
})

export const experienceInput = z.object({
  role: text(120).min(1, 'Role is required'),
  company: text(120).min(1, 'Company is required'),
  location: optText(120),
  startDate: text(40).min(1, 'Start date is required'),
  endDate: optText(40),
  description: text(1500).default(''),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
})

export const educationInput = z.object({
  degree: text(160).min(1, 'Degree is required'),
  institution: text(160).min(1, 'Institution is required'),
  startDate: text(40).min(1, 'Start date is required'),
  endDate: optText(40),
  description: text(1500).default(''),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
})

export const certificationInput = z.object({
  name: text(160).min(1, 'Name is required'),
  issuer: text(160).min(1, 'Issuer is required'),
  year: z.coerce.number().int().min(1990).max(2100).nullish().transform(v => v ?? null),
  url: optUrl,
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
})

export const serviceCategoryInput = z.object({
  name: text(80).min(1, 'Name is required'),
  slug,
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0)
})

export const blogCategoryInput = z.object({
  name: text(80).min(1, 'Name is required'),
  slug,
  description: optText(300)
})

export const tagInput = z.object({ name: text(40).min(1, 'Name is required'), slug })

export const mediaUpdateInput = z.object({ alt: text(300) })
