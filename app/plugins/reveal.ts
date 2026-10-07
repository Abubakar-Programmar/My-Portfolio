// v-reveal: fades/slides elements in as they scroll into view. Elements that are already
// visible on load are left untouched (no hidden flash, no LCP penalty) and users with
// prefers-reduced-motion get no animation at all.
interface RevealOptions { delay?: number; image?: boolean }

export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  const getObserver = () =>
    (observer ??= new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    ))

  nuxtApp.vueApp.directive<HTMLElement, RevealOptions | number | undefined>('reveal', {
    mounted(el, binding) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) return
      const opts = typeof binding.value === 'number' ? { delay: binding.value } : (binding.value ?? {})
      el.classList.add(opts.image ? 'img-reveal' : 'reveal')
      el.style.setProperty('--reveal-delay', `${opts.delay ?? 0}ms`)
      getObserver().observe(el)
    },
    unmounted(el) {
      observer?.unobserve(el)
    },
    getSSRProps: () => ({})
  })
})
