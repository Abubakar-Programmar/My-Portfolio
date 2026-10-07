export default defineNuxtPlugin(() => {
  setSiteUrl(useRuntimeConfig().public.siteUrl)
})
