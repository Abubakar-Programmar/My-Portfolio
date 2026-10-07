import { notification } from '../database/schema'
import type { NotificationSettings } from '../../shared/schemas/settings'
import { publishNotification } from './bus'

export interface NotifyInput {
  type: 'message' | 'login_alert' | 'subscriber' | 'system_error' | 'weekly_summary'
  title: string
  body?: string
  /** Admin-relative link, e.g. /admin/inbox/<id> */
  link?: string
  /** Which preference toggle controls the email for this event. */
  preference: keyof NotificationSettings
  email?: { subject: string; html: string; text: string; replyTo?: string }
}

/**
 * Stores the notification first (so nothing is lost if mail fails) and pushes it live to the
 * dashboard. The owner email is sent afterwards if the matching preference is enabled;
 * `emailDone` resolves when that attempt has finished and never rejects, so callers may
 * await it or let it run in the background.
 */
export async function notify(input: NotifyInput): Promise<{ id: string | null; emailDone: Promise<void> }> {
  const [row] = await useDb()
    .insert(notification)
    .values({ type: input.type, title: input.title, body: input.body ?? null, link: input.link ?? null })
    .returning()
  if (!row) return { id: null, emailDone: Promise.resolve() }

  publishNotification({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    link: row.link,
    createdAt: row.createdAt.toISOString()
  })

  const mail = input.email
  const emailDone = (async () => {
    if (!mail) return
    const settings = await getSettings()
    if (!settings.notifications[input.preference]) return
    const to = await notificationRecipient()
    if (!to) return
    await sendMail({ to, kind: input.type, notificationId: row.id, ...mail })
  })().catch((err) => {
    console.error('[notify] email step failed:', err instanceof Error ? err.message : err)
  })

  return { id: row.id, emailDone }
}

/** Reports an operational problem to the owner without ever throwing. */
export async function notifySystemError(title: string, detail: string) {
  try {
    const settings = await getSettings()
    const heading = `System error: ${title}`
    const mail = alertEmail(settings.general.siteTitle, heading, [detail.slice(0, 500)], appUrl('/admin'))
    await notify({ type: 'system_error', title: heading, body: detail.slice(0, 500), preference: 'onSystemError', email: mail })
  } catch (err) {
    console.error('[notify] could not report system error:', err instanceof Error ? err.message : err)
  }
}
