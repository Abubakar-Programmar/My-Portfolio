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

const WHATSAPP_GREETING = 'Hello! I visited your portfolio website and I am interested in working with you. I would like to discuss a project — could you let me know when you are available to talk?'

/** wa.me link that opens a chat with a polite, ready-to-send first message. `number` is digits with country code. */
export function whatsappUrl(number: string, message: string = WHATSAPP_GREETING): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
