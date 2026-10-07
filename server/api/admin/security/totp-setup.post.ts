import { eq } from 'drizzle-orm'
import QRCode from 'qrcode'
import { Secret, TOTP } from 'otpauth'
import { adminUser } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const secret = new Secret({ size: 20 })
  const totp = new TOTP({ issuer: 'Portfolio Admin', label: user.email, secret })
  await useDb().update(adminUser).set({ totpSecret: secret.base32, totpEnabled: false }).where(eq(adminUser.id, user.id))
  return { secret: secret.base32, qr: await QRCode.toDataURL(totp.toString(), { margin: 1, width: 220 }) }
})
