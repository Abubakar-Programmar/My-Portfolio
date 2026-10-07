// Marks the document once Vue has taken over, so end-to-end tests (and any script)
// can wait for interactivity instead of guessing with timeouts.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    document.documentElement.dataset.hydrated = 'true'
  })
})
