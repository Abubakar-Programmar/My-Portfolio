import { eq } from 'drizzle-orm'
import { Secret, TOTP } from 'otpauth'
import { adminUser } from '../../../database/schema'
import { totpCodeSchema } from '../../../../shared/schemas/auth'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const { code } = await readValid(event, totpCodeSchema)
  const db = useDb()
  const [row] = await db.select().from(adminUser).where(eq(adminUser.id, user.id))
  if (!row?.totpSecret) throw apiError(400, 'Start the 2FA setup first.')
  const totp = new TOTP({ issuer: 'Portfolio Admin', label: user.email, secret: Secret.fromBase32(row.totpSecret) })
  if (totp.validate({ token: code, window: 1 }) === null) throw apiError(400, 'That code is not valid.', { code: 'Invalid code' })
  await db.update(adminUser).set({ totpEnabled: true }).where(eq(adminUser.id, user.id))
  await logActivity(user.email, 'security', 'admin_user', user.id, 'Enabled two-factor authentication')
  return { ok: true }
})
