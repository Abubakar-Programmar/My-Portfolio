import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { count, desc, eq, gte, lt, and, sql } from 'drizzle-orm'
import { activityLog, blogPost, message, pageView, project, service } from '../../database/schema'

const DAY = 86_400_000

/** Fills days with no rows so charts always get a continuous series. */
function fillDays(rows: { day: string; n: number }[], days: number) {
  const map = new Map(rows.map(r => [r.day, r.n]))
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(Date.now() - (days - 1 - i) * DAY).toISOString().slice(0, 10)
    return { day, value: map.get(day) ?? 0 }
  })
}

export default defineEventHandler(async () => {
  const db = useDb()
  const now = Date.now()
  const weekStart = new Date(now - 7 * DAY)
  const prevWeekStart = new Date(now - 14 * DAY)
  const since30 = new Date(now - 29 * DAY)
  since30.setUTCHours(0, 0, 0, 0)

  const one = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0
  const day = (col: AnyPgColumn) => sql<string>`to_char(date_trunc('day', ${col} at time zone 'UTC'), 'YYYY-MM-DD')`

  const [totalMessages, unread, services, projects, posts, viewsWeek, viewsPrev, msgSeries, viewSeries, topPages, recentMessages, recentActivity] = await Promise.all([
    one(db.select({ n: count() }).from(message)),
    one(db.select({ n: count() }).from(message).where(eq(message.status, 'unread'))),
    one(db.select({ n: count() }).from(service)),
    one(db.select({ n: count() }).from(project)),
    one(db.select({ n: count() }).from(blogPost)),
    one(db.select({ n: count() }).from(pageView).where(gte(pageView.createdAt, weekStart))),
    one(db.select({ n: count() }).from(pageView).where(and(gte(pageView.createdAt, prevWeekStart), lt(pageView.createdAt, weekStart)))),
    db.select({ day: day(message.createdAt), n: count() }).from(message).where(gte(message.createdAt, since30)).groupBy(day(message.createdAt)),
    db.select({ day: day(pageView.createdAt), n: count() }).from(pageView).where(gte(pageView.createdAt, since30)).groupBy(day(pageView.createdAt)),
    db.select({ path: pageView.path, views: count() }).from(pageView).where(gte(pageView.createdAt, since30)).groupBy(pageView.path).orderBy(desc(count())).limit(8),
    db.select().from(message).orderBy(desc(message.createdAt)).limit(5),
    db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(8)
  ])

  return {
    stats: { totalMessages, unread, services, projects, posts, viewsWeek, viewsPrev },
    messagesOverTime: fillDays(msgSeries, 30),
    visitsOverTime: fillDays(viewSeries, 30),
    topPages,
    recentMessages,
    recentActivity
  }
})
