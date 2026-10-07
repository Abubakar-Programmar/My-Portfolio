// CSRF protection for the JSON API: browsers always attach Origin to cross-site
// state-changing requests, so a mismatching Origin is rejected. Combined with
// SameSite=strict session cookies and JSON-only bodies.
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function originHost(origin: string): string | null {
  try {
    return new URL(origin).host
  } catch {
    return null
  }
}

export default defineEventHandler((event) => {
  if (!MUTATING.has(event.method) || !event.path.startsWith('/api/')) return
  const origin = getRequestHeader(event, 'origin')
  if (!origin) return
  if (originHost(origin) !== getRequestHost(event, { xForwardedHost: true })) throw apiError(403, 'Cross-site request blocked')
})
