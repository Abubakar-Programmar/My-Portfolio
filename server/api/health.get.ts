import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    await useDb().execute(sql`select 1`)
    return { status: 'ok', time: new Date().toISOString() }
  } catch {
    setResponseStatus(event, 503)
    return { status: 'degraded', time: new Date().toISOString() }
  }
})
