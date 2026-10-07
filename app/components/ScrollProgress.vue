<script setup lang="ts">
const progress = ref(0)
let frame = 0

function update() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    progress.value = max > 0 ? Math.min(1, window.scrollY / max) : 0
  })
}

onMounted(update)
useEventListener('scroll', update, { passive: true })
useEventListener('resize', update, { passive: true })
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden="true">
    <div class="h-full origin-left bg-gradient-to-r from-accent to-accent-ring" :style="{ transform: `scaleX(${progress})` }" />
  </div>
</template>
