import type { H3Event } from 'h3'
import type { z } from 'zod'

/** Consistent API error: { statusCode, statusMessage, message, data: { errors? } } — no stack traces in production. */
export function apiError(statusCode: number, message: string, errors?: Record<string, string>) {
  return createError({ statusCode, statusMessage: message, message, data: errors ? { errors } : undefined })
}

export function parseInput<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || 'form'
    errors[key] ??= issue.message
  }
  throw apiError(422, Object.values(errors)[0] ?? 'Validation failed', errors)
}

export async function readValid<T extends z.ZodType>(event: H3Event, schema: T): Promise<z.output<T>> {
  const body = await readBody(event).catch(() => null)
  return parseInput(schema, body ?? {})
}

export function queryValid<T extends z.ZodType>(event: H3Event, schema: T): z.output<T> {
  return parseInput(schema, getQuery(event))
}

export function clientIp(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
}

export function userAgent(event: H3Event): string {
  return (getRequestHeader(event, 'user-agent') ?? '').slice(0, 300)
}

export function deviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobi|android|iphone|ipod/i.test(ua)) return 'mobile'
  return 'desktop'
}

export function appUrl(path = ''): string {
  const base = (useRuntimeConfig().public.siteUrl || 'http://localhost:3000').replace(/\/$/, '')
  return `${base}${path}`
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
