import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'
import { dbUrl } from './server/database/connection'

// The portfolio lives in its own Postgres schema so it can share a database
// with other applications without touching their tables.
export default defineConfig({
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: dbUrl() },
  schemaFilter: ['portfolio'],
  migrations: { schema: 'portfolio', table: '__migrations' }
})
