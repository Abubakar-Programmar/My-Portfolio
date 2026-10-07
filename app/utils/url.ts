// Set once at startup by plugins/site-url.ts. Kept out of the Nuxt context on purpose so it can be
// used inside lazy head/schema getters that unhead evaluates outside of component setup.
let siteUrl = ''

export function setSiteUrl(value: string) {
  siteUrl = value.replace(/\/$/, '')
}

export function absoluteUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
