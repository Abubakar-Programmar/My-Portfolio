<script setup lang="ts">
// Counts up when scrolled into view. Server HTML contains the final number (good for SEO/no-JS).
const props = withDefaults(defineProps<{ to: number; suffix?: string; duration?: number }>(), { suffix: '', duration: 1400 })
const el = ref<HTMLElement | null>(null)
const shown = ref(props.to)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !el.value) return
  shown.value = 0
  const { stop } = useIntersectionObserver(el, ([entry]) => {
    if (!entry?.isIntersecting) return
    stop()
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / props.duration)
      shown.value = Math.round(props.to * (1 - (1 - t) ** 3))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, { threshold: 0.4 })
})
</script>

<template>
  <span ref="el" class="tabular-nums">{{ shown.toLocaleString('en-US') }}{{ suffix }}</span>
</template>
