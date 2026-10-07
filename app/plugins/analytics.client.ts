// First-party, cookie-less page-view tracking. Skips the admin, honours Do Not Track.
export default defineNuxtPlugin((nuxtApp) => {
  if (navigator.doNotTrack === '1') return
  let last = ''

  const track = (path: string) => {
    if (path.startsWith('/admin') || path === last) return
    last = path
    $fetch('/api/track', { method: 'POST', body: { path, referrer: document.referrer || undefined } }).catch(() => {})
  }

  nuxtApp.hook('page:finish', () => track(useRoute().path))
})
