import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

// Everything lives in the "portfolio" schema so the app can share a database
// with unrelated applications without colliding with their tables.
export const portfolio = pgSchema('portfolio')

const id = () => uuid('id').primaryKey().defaultRandom()
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())

export type PublishStatus = 'draft' | 'published'
export type PostStatus = 'draft' | 'scheduled' | 'published'
export type MessageStatus = 'unread' | 'read' | 'archived' | 'spam'

export interface ProcessStep { title: string; description: string }
export interface FaqItem { question: string; answer: string }
export interface PricingPackage { name: string; price: string; description: string; features: string[] }
export interface ResultMetric { label: string; before: string; after: string }

// ───────────────────────── Auth ─────────────────────────

export const adminUser = portfolio.table('admin_user', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  totpSecret: text('totp_secret'),
  totpEnabled: boolean('totp_enabled').notNull().default(false),
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt()
})

export const adminSession = portfolio.table(
  'admin_session',
  {
    id: id(),
    userId: uuid('user_id').notNull().references(() => adminUser.id, { onDelete: 'cascade' }),
    ip: text('ip'),
    userAgent: text('user_agent'),
    deviceHash: text('device_hash'),
    createdAt: createdAt(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true })
  },
  t => [index('admin_session_user_idx').on(t.userId)]
)

export const loginAttempt = portfolio.table(
  'login_attempt',
  {
    id: id(),
    email: text('email').notNull(),
    ip: text('ip'),
    userAgent: text('user_agent'),
    success: boolean('success').notNull(),
    reason: text('reason'),
    createdAt: createdAt()
  },
  t => [index('login_attempt_created_idx').on(t.createdAt), index('login_attempt_email_idx').on(t.email)]
)

export const passwordResetToken = portfolio.table(
  'password_reset_token',
  {
    id: id(),
    userId: uuid('user_id').notNull().references(() => adminUser.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: createdAt()
  },
  t => [index('password_reset_user_idx').on(t.userId)]
)

// ───────────────────────── Services ─────────────────────────

export const serviceCategory = portfolio.table('service_category', {
  id: id(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt()
})

export const service = portfolio.table(
  'service',
  {
    id: id(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    summary: text('summary').notNull().default(''),
    overview: text('overview').notNull().default(''),
    icon: text('icon').notNull().default('code'),
    coverImage: text('cover_image'),
    images: jsonb('images').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    deliverables: jsonb('deliverables').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    processSteps: jsonb('process_steps').$type<ProcessStep[]>().notNull().default(sql`'[]'::jsonb`),
    tools: jsonb('tools').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    showPricing: boolean('show_pricing').notNull().default(false),
    startingPrice: text('starting_price'),
    packages: jsonb('packages').$type<PricingPackage[]>().notNull().default(sql`'[]'::jsonb`),
    turnaround: text('turnaround'),
    faqs: jsonb('faqs').$type<FaqItem[]>().notNull().default(sql`'[]'::jsonb`),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    status: text('status').$type<PublishStatus>().notNull().default('draft'),
    featured: boolean('featured').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    categoryId: uuid('category_id').references(() => serviceCategory.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  t => [index('service_status_idx').on(t.status, t.sortOrder), index('service_category_idx').on(t.categoryId)]
)

// ───────────────────────── Projects ─────────────────────────

export const project = portfolio.table(
  'project',
  {
    id: id(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    summary: text('summary').notNull().default(''),
    client: text('client'),
    year: integer('year'),
    problem: text('problem').notNull().default(''),
    solution: text('solution').notNull().default(''),
    results: jsonb('results').$type<ResultMetric[]>().notNull().default(sql`'[]'::jsonb`),
    techStack: jsonb('tech_stack').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    coverImage: text('cover_image'),
    gallery: jsonb('gallery').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    liveUrl: text('live_url'),
    githubUrl: text('github_url'),
    serviceId: uuid('service_id').references(() => service.id, { onDelete: 'set null' }),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    status: text('status').$type<PublishStatus>().notNull().default('draft'),
    featured: boolean('featured').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  t => [index('project_status_idx').on(t.status, t.sortOrder), index('project_service_idx').on(t.serviceId)]
)

// ───────────────────────── Blog ─────────────────────────

export const blogCategory = portfolio.table('blog_category', {
  id: id(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: createdAt()
})

export const tag = portfolio.table('tag', {
  id: id(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: createdAt()
})

export const blogPost = portfolio.table(
  'blog_post',
  {
    id: id(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    excerpt: text('excerpt').notNull().default(''),
    content: text('content').notNull().default(''),
    coverImage: text('cover_image'),
    status: text('status').$type<PostStatus>().notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    readingMinutes: integer('reading_minutes').notNull().default(1),
    featured: boolean('featured').notNull().default(false),
    categoryId: uuid('category_id').references(() => blogCategory.id, { onDelete: 'set null' }),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  t => [index('blog_post_status_idx').on(t.status, t.publishedAt), index('blog_post_category_idx').on(t.categoryId)]
)

export const blogPostTag = portfolio.table(
  'blog_post_tag',
  {
    postId: uuid('post_id').notNull().references(() => blogPost.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id').notNull().references(() => tag.id, { onDelete: 'cascade' })
  },
  t => [primaryKey({ columns: [t.postId, t.tagId] }), index('blog_post_tag_tag_idx').on(t.tagId)]
)

// ───────────────────────── Profile content ─────────────────────────

export const testimonial = portfolio.table('testimonial', {
  id: id(),
  name: text('name').notNull(),
  role: text('role'),
  company: text('company'),
  quote: text('quote').notNull(),
  avatar: text('avatar'),
  rating: integer('rating').notNull().default(5),
  featured: boolean('featured').notNull().default(true),
  status: text('status').$type<PublishStatus>().notNull().default('published'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt()
})

export const skill = portfolio.table('skill', {
  id: id(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  level: integer('level').notNull().default(80),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt()
})

export const experience = portfolio.table('experience', {
  id: id(),
  role: text('role').notNull(),
  company: text('company').notNull(),
  location: text('location'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  description: text('description').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt()
})

export const education = portfolio.table('education', {
  id: id(),
  degree: text('degree').notNull(),
  institution: text('institution').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  description: text('description').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt()
})

export const certification = portfolio.table('certification', {
  id: id(),
  name: text('name').notNull(),
  issuer: text('issuer').notNull(),
  year: integer('year'),
  url: text('url'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt()
})

// ───────────────────────── Inbox & notifications ─────────────────────────

export const message = portfolio.table(
  'message',
  {
    id: id(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    serviceId: uuid('service_id').references(() => service.id, { onDelete: 'set null' }),
    serviceName: text('service_name'),
    budget: text('budget'),
    body: text('body').notNull(),
    status: text('status').$type<MessageStatus>().notNull().default('unread'),
    starred: boolean('starred').notNull().default(false),
    notes: text('notes'),
    ip: text('ip'),
    createdAt: createdAt()
  },
  t => [index('message_status_idx').on(t.status, t.createdAt), index('message_created_idx').on(t.createdAt)]
)

export const messageReply = portfolio.table(
  'message_reply',
  {
    id: id(),
    messageId: uuid('message_id').notNull().references(() => message.id, { onDelete: 'cascade' }),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    status: text('status').$type<'sent' | 'failed'>().notNull(),
    error: text('error'),
    createdAt: createdAt()
  },
  t => [index('message_reply_message_idx').on(t.messageId)]
)

export const notification = portfolio.table(
  'notification',
  {
    id: id(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    link: text('link'),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: createdAt()
  },
  t => [index('notification_created_idx').on(t.createdAt)]
)

export const emailLog = portfolio.table(
  'email_log',
  {
    id: id(),
    kind: text('kind').notNull(),
    toAddress: text('to_address').notNull(),
    subject: text('subject').notNull(),
    status: text('status').$type<'sent' | 'failed'>().notNull(),
    attempts: integer('attempts').notNull().default(1),
    error: text('error'),
    notificationId: uuid('notification_id').references(() => notification.id, { onDelete: 'set null' }),
    createdAt: createdAt()
  },
  t => [index('email_log_created_idx').on(t.createdAt), index('email_log_status_idx').on(t.status)]
)

export const subscriber = portfolio.table('subscriber', {
  id: id(),
  email: text('email').notNull().unique(),
  createdAt: createdAt()
})

// ───────────────────────── Platform ─────────────────────────

export const setting = portfolio.table('setting', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<Record<string, unknown>>().notNull(),
  updatedAt: updatedAt()
})

export const mediaAsset = portfolio.table('media_asset', {
  id: id(),
  filename: text('filename').notNull().unique(),
  originalName: text('original_name').notNull(),
  mime: text('mime').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  alt: text('alt').notNull().default(''),
  createdAt: createdAt()
})

export const activityLog = portfolio.table(
  'activity_log',
  {
    id: id(),
    actor: text('actor').notNull(),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id'),
    summary: text('summary').notNull(),
    createdAt: createdAt()
  },
  t => [index('activity_log_created_idx').on(t.createdAt)]
)

export const pageView = portfolio.table(
  'page_view',
  {
    id: id(),
    path: text('path').notNull(),
    referrer: text('referrer'),
    device: text('device').notNull().default('desktop'),
    country: text('country'),
    createdAt: createdAt()
  },
  t => [index('page_view_created_idx').on(t.createdAt), index('page_view_path_idx').on(t.path)]
)

