import { z } from 'zod'
import { pageView } from '../database/schema'

const schema = z.object({
  path: z.string().max(300).startsWith('/'),
  referrer: z.string().max(500).optional()
})

// First-party, cookie-less analytics: no IP, no user id, honours Do Not Track.
export default defineEventHandler(async (event) => {
  if (getRequestHeader(event, 'dnt') === '1') return { ok: true }
  const ua = userAgent(event)
  if (!ua || /bot|crawl|spider|slurp|headless|lighthouse/i.test(ua)) return { ok: true }

  const { path, referrer } = parseInput(schema, await readBody(event).catch(() => ({})))
  const cleanPath = (path.split(/[?#]/)[0] ?? '/').replace(/(.)\/$/, '$1')
  if (cleanPath.startsWith('/admin')) return { ok: true }

  let referrerHost: string | null = null
  try {
    if (referrer) {
      const host = new URL(referrer).host
      if (host && host !== getRequestHost(event, { xForwardedHost: true })) referrerHost = host
    }
  } catch { /* ignore malformed referrers */ }

  const country = getRequestHeader(event, 'cf-ipcountry') ?? getRequestHeader(event, 'x-vercel-ip-country') ?? null
  await useDb().insert(pageView).values({
    path: cleanPath,
    referrer: referrerHost,
    device: deviceType(ua),
    country: country && /^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : null
  })
  return { ok: true }
})
