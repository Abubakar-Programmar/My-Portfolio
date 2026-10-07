import { runMigrations } from '../database/migrate'

// Applies pending migrations before the first request so `pnpm dev` always works
// against an up-to-date schema.
export default defineNitroPlugin(async () => {
  try {
    await runMigrations()
    console.log('[db] schema is up to date')
  } catch (err) {
    console.error('[db] could not apply migrations:', err instanceof Error ? err.message : err)
  }
})
