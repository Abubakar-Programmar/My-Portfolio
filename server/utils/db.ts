import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/schema'
import { dbUrl } from '../database/connection'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (!_db) {
    const client = postgres(dbUrl(useRuntimeConfig().databaseUrl || undefined), {
      max: 10,
      onnotice: () => {}
    })
    _db = drizzle(client, { schema })
  }
  return _db
}
