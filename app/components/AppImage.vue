<script setup lang="ts">
// Picks the right renderer: uploaded media goes through @nuxt/image (resized on demand
// with sharp), SVG/static assets render as-is. Always pass width/height to prevent layout shift.
const props = withDefaults(
  defineProps<{
    src?: string | null
    alt?: string
    width?: number
    height?: number
    sizes?: string
    loading?: 'lazy' | 'eager'
    priority?: boolean
  }>(),
  { alt: '', loading: 'lazy', sizes: '(min-width: 1024px) 50vw, 100vw' }
)

// Uploaded files are resized on demand by /media/<file>?w=…, so build the responsive set by hand.
const MEDIA_WIDTHS = [480, 800, 1200, 1600]
const mediaUrl = (w: number) => `${props.src}?w=${w}&f=webp`
const isMedia = computed(() => props.src?.startsWith('/media/') && !props.src.endsWith('.pdf'))
</script>

<template>
  <img
    v-if="src && isMedia"
    :src="mediaUrl(MEDIA_WIDTHS[1])"
    :srcset="MEDIA_WIDTHS.map(w => `${mediaUrl(w)} ${w}w`).join(', ')"
    :sizes="sizes"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="priority ? 'eager' : loading"
    :fetchpriority="priority ? 'high' : 'auto'"
    decoding="async"
  >
  <img
    v-else-if="src"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="priority ? 'eager' : loading"
    :fetchpriority="priority ? 'high' : 'auto'"
    decoding="async"
  >
  <div v-else class="bg-gradient-to-br from-accent-soft to-surface" role="presentation" :style="{ aspectRatio: width && height ? `${width}/${height}` : undefined }" />
</template>
