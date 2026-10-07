// Shared by the Nitro runtime, drizzle-kit and the seed script (no Nuxt auto-imports here).

/** DATABASE_URL without ORM-specific query params (e.g. connection_limit) the pg driver rejects. */
export function dbUrl(raw = process.env.DATABASE_URL): string {
  if (!raw) throw new Error('DATABASE_URL is not set')
  const url = new URL(raw)
  url.search = ''
  return url.toString()
}
