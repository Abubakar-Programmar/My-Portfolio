import { desc } from 'drizzle-orm'
import { loginAttempt } from '../../../database/schema'

export default defineEventHandler(async () => {
  return useDb().select().from(loginAttempt).orderBy(desc(loginAttempt.createdAt)).limit(50)
})
