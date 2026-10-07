import { createHash, randomBytes } from 'node:crypto'
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
