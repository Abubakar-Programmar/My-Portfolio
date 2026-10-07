import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { message, messageReply } from '../../../../database/schema'
import { replySchema } from '../../../../../shared/schemas/contact'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = parseInput(z.uuid(), getRouterParam(event, 'id'))
  const input = await readValid(event, replySchema)
  const db = useDb()
  const [row] = await db.select().from(message).where(eq(message.id, id))
  if (!row) throw apiError(404, 'Message not found')

  const settings = await getSettings()
  const mail = replyEmail(settings.general.siteTitle, input.subject, input.body)
  const owner = settings.contact.email || (await notificationRecipient())
  const result = await sendMail({ to: row.email, kind: 'reply', replyTo: owner || undefined, ...mail })

  const [reply] = await db
    .insert(messageReply)
    .values({ messageId: id, subject: input.subject, body: input.body, status: result.ok ? 'sent' : 'failed', error: result.error ?? null })
    .returning()
  if (!result.ok) throw apiError(502, `The reply could not be sent: ${result.error}`)

  await db.update(message).set({ status: 'read' }).where(eq(message.id, id))
  await logActivity(user.email, 'reply', 'Message', id, `Replied to ${row.name}`)
  return reply
})
