import { subscriber } from '../database/schema'
import { subscribeSchema } from '../../shared/schemas/contact'

export default defineEventHandler(async (event) => {
  const settings = await getSettings()
  if (!settings.notifications.subscribersEnabled) throw apiError(404, 'Subscriptions are not available')
  const body = ((await readBody(event).catch(() => null)) ?? {}) as Record<string, unknown>
  if (typeof body.website === 'string' && body.website.length > 0) return { ok: true }

  const { email } = parseInput(subscribeSchema, body)
  const [row] = await useDb().insert(subscriber).values({ email: email.toLowerCase() }).onConflictDoNothing().returning()
  if (row) {
    const mail = alertEmail(settings.general.siteTitle, 'New blog subscriber', [`${row.email} subscribed to the blog.`], appUrl('/admin/inbox'))
    const { emailDone } = await notify({ type: 'subscriber', title: 'New blog subscriber', body: row.email, link: '/admin/export', preference: 'onSubscriber', email: mail })
    void emailDone
  }
  return { ok: true }
})
