import { z } from 'zod'

export const BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 – $3,000',
  '$3,000 – $10,000',
  '$10,000+',
  'Not sure yet'
] as const

/** Minimum seconds between the form being rendered and submitted (bots submit instantly). */
export const MIN_FILL_SECONDS = 3

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.email('Please enter a valid email address').max(200),
  serviceId: z
    .string()
    .nullish()
    .transform(v => (v ? v : null))
    .pipe(z.uuid().nullable()),
  /** Free-text service, used when the visitor picks "Other" instead of a listed service. */
  customService: z.string().trim().max(120).nullish().transform(v => (v ? v : null)),
  budget: z.enum(BUDGET_RANGES).nullish().transform(v => v ?? null),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(5000),
  /** Honeypot: real visitors never see or fill this field. */
  website: z.string().max(0).optional().default(''),
  /** Epoch ms when the form was rendered, for the minimum-fill-time check. */
  startedAt: z.coerce.number().int()
})

export type ContactInput = z.input<typeof contactSchema>

export const subscribeSchema = z.object({
  email: z.email('Please enter a valid email address').max(200),
  website: z.string().max(0).optional().default('')
})

export const replySchema = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000)
})

export const messageUpdateSchema = z.object({
  status: z.enum(['unread', 'read', 'archived', 'spam']).optional(),
  starred: z.boolean().optional(),
  notes: z.string().max(5000).nullish().optional()
})

export const messageBulkSchema = z.object({
  ids: z.array(z.uuid()).min(1).max(200),
  action: z.enum(['read', 'unread', 'archive', 'spam', 'star', 'unstar', 'delete'])
})
