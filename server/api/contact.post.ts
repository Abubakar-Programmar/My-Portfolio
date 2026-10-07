import { eq } from 'drizzle-orm'
import { message, service } from '../database/schema'
import { contactSchema, MIN_FILL_SECONDS } from '../../shared/schemas/contact'

export default defineEventHandler(async (event) => {
  const body = ((await readBody(event).catch(() => null)) ?? {}) as Record<string, unknown>

  // Spam defences. Bots get a normal-looking success response and nothing is stored.
  const honeypotFilled = typeof body.website === 'string' && body.website.length > 0
  const tooFast = Date.now() - Number(body.startedAt) < MIN_FILL_SECONDS * 1000
  if (honeypotFilled || tooFast) return { ok: true }

  const input = parseInput(contactSchema, body)
  const db = useDb()
  const settings = await getSettings()

  const [svc] = input.serviceId
    ? await db.select({ id: service.id, title: service.title }).from(service).where(eq(service.id, input.serviceId))
    : []

  const [row] = await db
    .insert(message)
    .values({
      name: input.name,
      email: input.email.toLowerCase(),
      serviceId: svc?.id ?? null,
      serviceName: svc?.title ?? (input.serviceId ? null : input.customService),
      budget: input.budget,
      body: input.message,
      ip: clientIp(event)
    })
    .returning()
  if (!row) throw apiError(500, 'Your message could not be saved. Please try again.')

  const mail = newMessageEmail({
    siteName: settings.general.siteTitle,
    name: row.name,
    email: row.email,
    service: row.serviceName,
    budget: row.budget,
    message: row.body,
    receivedAt: row.createdAt.toUTCString(),
    dashboardUrl: appUrl(`/admin/inbox/${row.id}`)
  })

  // Notification is stored before any email is attempted; email runs in the background.
  const { emailDone } = await notify({
    type: 'message',
    title: `New ${row.serviceName ? 'quote request' : 'message'} from ${row.name}`,
    body: row.body.slice(0, 160),
    link: `/admin/inbox/${row.id}`,
    preference: 'onMessage',
    email: { ...mail, replyTo: row.email }
  })
  void emailDone

  if (settings.notifications.autoReply) {
    const reply = autoReplyEmail(settings.general.siteTitle, row.name, settings.notifications.autoReplyMessage, row.body)
    void sendMail({ to: row.email, kind: 'auto_reply', replyTo: settings.contact.email || undefined, ...reply })
  }

  return { ok: true }
})
