import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { and, eq, isNull } from 'drizzle-orm'
import type { H3Event } from 'h3'
import { adminSession } from '../database/schema'

export { hashPassword as hashAdminPassword, verifyPassword as verifyAdminPassword } from '../database/password'

export interface AdminContext {
  user: { id: string; name: string; email: string }
  sid: string
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

/** A fresh 6-digit one-time code (cryptographically random, zero-padded). */
export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

/**
 * Keyed hash of a one-time code. HMAC (not a bare hash) so a leaked table cannot be brute-forced
 * offline, and so an OTP hash can never be mistaken for a sha256 reset-token hash.
 */
export function otpHash(userId: string, otp: string): string {
  const secret = (useRuntimeConfig().session as { password?: string } | undefined)?.password
  if (!secret) throw apiError(500, 'Server is not configured for password recovery.')
  return createHmac('sha256', secret).update(`otp:${userId}:${otp}`).digest('hex')
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

/**
 * Server-side admin check. Validates the sealed session cookie AND that its session
 * row has not been revoked, so "revoke session" takes effect immediately.
 */
export async function requireAdmin(event: H3Event): Promise<AdminContext> {
  if (event.context.admin) return event.context.admin as AdminContext
  const session = await getUserSession(event)
  const sid = session.secure?.sid
  if (!session.user || !sid) throw apiError(401, 'Authentication required')

  const db = useDb()
  const [row] = await db
    .select({ id: adminSession.id, lastSeenAt: adminSession.lastSeenAt })
    .from(adminSession)
    .where(and(eq(adminSession.id, sid), eq(adminSession.userId, session.user.id), isNull(adminSession.revokedAt)))
  if (!row) {
    await clearUserSession(event)
    throw apiError(401, 'Your session has ended. Please sign in again.')
  }
  if (Date.now() - row.lastSeenAt.getTime() > 5 * 60_000) {
    await db.update(adminSession).set({ lastSeenAt: new Date() }).where(eq(adminSession.id, sid))
  }
  const ctx: AdminContext = { user: session.user, sid }
  event.context.admin = ctx
  return ctx
}
