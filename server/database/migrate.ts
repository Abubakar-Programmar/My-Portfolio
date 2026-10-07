import 'dotenv/config'
import { resolve } from 'node:path'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { dbUrl } from './connection'

export const migrationsFolder = resolve(process.cwd(), 'server/database/migrations')

/** Applies pending migrations inside the dedicated "portfolio" schema. */
export async function runMigrations(url = dbUrl()) {
  const client = postgres(url, { max: 1, onnotice: () => {} })
  try {
    await client.unsafe('CREATE SCHEMA IF NOT EXISTS portfolio')
    await migrate(drizzle(client), {
      migrationsFolder,
      migrationsSchema: 'portfolio',
      migrationsTable: '__migrations'
    })
  } finally {
    await client.end()
  }
}

// Executed directly: `pnpm db:migrate`
if (process.argv[1] && /migrate\.ts$/.test(process.argv[1].replace(/\\/g, '/'))) {
  runMigrations()
    .then(() => console.log('[db] migrations applied'))
    .catch((err) => {
      console.error('[db] migration failed:', err instanceof Error ? err.message : err)
      process.exit(1)
    })
}
