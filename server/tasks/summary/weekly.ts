import { and, count, desc, eq, gte, lt } from 'drizzle-orm'
import { message, pageView } from '../../database/schema'

const DAY = 86_400_000

// Scheduled every Monday 08:00 (see nitro.scheduledTasks). Can also be run manually: `nitro task run summary:weekly`.
export default defineTask({
  meta: { name: 'summary:weekly', description: 'Email the owner a weekly traffic and inbox summary' },
  async run() {
    const settings = await getSettings()
    if (!settings.notifications.weeklySummary) return { result: 'disabled' }

    const db = useDb()
    const now = Date.now()
    const weekStart = new Date(now - 7 * DAY)
    const prevStart = new Date(now - 14 * DAY)
    const n = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0

    const [messages, unread, views, viewsPrev, topPages] = await Promise.all([
      n(db.select({ n: count() }).from(message).where(gte(message.createdAt, weekStart))),
      n(db.select({ n: count() }).from(message).where(eq(message.status, 'unread'))),
      n(db.select({ n: count() }).from(pageView).where(gte(pageView.createdAt, weekStart))),
      n(db.select({ n: count() }).from(pageView).where(and(gte(pageView.createdAt, prevStart), lt(pageView.createdAt, weekStart)))),
      db.select({ path: pageView.path, views: count() }).from(pageView).where(gte(pageView.createdAt, weekStart)).groupBy(pageView.path).orderBy(desc(count())).limit(5)
    ])

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const mail = weeklySummaryEmail({
      siteName: settings.general.siteTitle,
      weekLabel: `${fmt(weekStart)} – ${fmt(new Date(now))}`,
      messages, unread, views, viewsPrev, topPages,
      dashboardUrl: appUrl('/admin')
    })
    const { emailDone } = await notify({
      type: 'weekly_summary',
      title: 'Your weekly summary is ready',
      body: `${messages} new message(s), ${views} page views`,
      link: '/admin',
      preference: 'weeklySummary',
      email: mail
    })
    await emailDone
    return { result: 'sent' }
  }
})
