import { describe, expect, it } from 'vitest'
import { loginSchema, passwordRule } from '../../shared/schemas/auth'
import { contactSchema, messageBulkSchema } from '../../shared/schemas/contact'
import { postInput, serviceInput, testimonialInput } from '../../shared/schemas/content'
import { notificationSettings, socialsSettings } from '../../shared/schemas/settings'

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', message: 'I need a new website, please.', startedAt: 1 }

describe('contactSchema', () => {
  it('accepts a valid message', () => expect(contactSchema.safeParse(valid).success).toBe(true))
  it('rejects bad emails and short messages', () => {
    const r = contactSchema.safeParse({ ...valid, email: 'nope', message: 'hi' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues.map(i => i.path[0])).toEqual(expect.arrayContaining(['email', 'message']))
  })
  it('rejects a filled honeypot', () => expect(contactSchema.safeParse({ ...valid, website: 'http://spam' }).success).toBe(false))
  it('normalises empty optional fields to null', () => {
    const r = contactSchema.parse({ ...valid, serviceId: '', budget: undefined })
    expect(r.serviceId).toBeNull()
    expect(r.budget).toBeNull()
  })
})

describe('auth schemas', () => {
  it('enforces password strength', () => {
    expect(passwordRule.safeParse('short1A').success).toBe(false)
    expect(passwordRule.safeParse('alllowercase123').success).toBe(false)
    expect(passwordRule.safeParse('GoodPassword123').success).toBe(true)
  })
  it('requires login fields', () => expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false))
})

describe('content schemas', () => {
  it('requires a service title and applies defaults', () => {
    expect(serviceInput.safeParse({ title: '' }).success).toBe(false)
    const s = serviceInput.parse({ title: 'SEO' })
    expect(s.status).toBe('draft')
    expect(s.deliverables).toEqual([])
  })
  it('rejects invalid slugs', () => expect(serviceInput.safeParse({ title: 'x1', slug: 'Not A Slug' }).success).toBe(false))
  it('parses post publish dates', () => {
    const p = postInput.parse({ title: 'Hello', status: 'scheduled', publishedAt: '2030-01-01T10:00:00.000Z' })
    expect(p.publishedAt).toBeInstanceOf(Date)
  })
  it('limits testimonial rating', () => expect(testimonialInput.safeParse({ name: 'Bob', quote: 'Great work indeed', rating: 9 }).success).toBe(false))
})

describe('settings & bulk schemas', () => {
  it('requires https social URLs', () => expect(socialsSettings.safeParse({ items: [{ label: 'X', url: 'javascript:alert(1)' }] }).success).toBe(false))
  it('validates the notification email', () => {
    const base = { onMessage: true, onLoginAlert: true, onSubscriber: true, onSystemError: true, weeklySummary: true, autoReply: true, autoReplyMessage: 'x', subscribersEnabled: true }
    expect(notificationSettings.safeParse({ ...base, email: 'bad' }).success).toBe(false)
    expect(notificationSettings.safeParse({ ...base, email: '' }).success).toBe(true)
  })
  it('limits bulk actions', () => expect(messageBulkSchema.safeParse({ ids: [], action: 'read' }).success).toBe(false))
})
