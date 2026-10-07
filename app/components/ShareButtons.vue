<script setup lang="ts">
const props = defineProps<{ title: string; path: string }>()
const toast = useToast()
const url = computed(() => absoluteUrl(props.path) ?? props.path)
const enc = (v: string) => encodeURIComponent(v)

const targets = computed(() => [
  { label: 'Share on X', icon: 'twitter', href: `https://twitter.com/intent/tweet?text=${enc(props.title)}&url=${enc(url.value)}` },
  { label: 'Share on LinkedIn', icon: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url.value)}` },
  { label: 'Share on Facebook', icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url.value)}` },
  { label: 'Share on WhatsApp', icon: 'whatsapp', href: `https://wa.me/?text=${enc(`${props.title} ${url.value}`)}` }
])

async function copy() {
  try {
    await navigator.clipboard.writeText(url.value)
    toast.success('Link copied to clipboard')
  } catch {
    toast.error('Could not copy the link')
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <span class="mr-1 text-sm font-semibold text-ink">Share</span>
    <a v-for="t in targets" :key="t.label" :href="t.href" target="_blank" rel="noopener noreferrer" class="grid h-10 w-10 place-items-center rounded-full border border-line text-body transition hover:-translate-y-0.5 hover:border-accent hover:text-accent" :aria-label="t.label">
      <AppIcon :name="t.icon" :size="18" />
    </a>
    <button type="button" class="grid h-10 w-10 place-items-center rounded-full border border-line text-body transition hover:-translate-y-0.5 hover:border-accent hover:text-accent" aria-label="Copy link" @click="copy">
      <AppIcon name="link" :size="18" />
    </button>
  </div>
</template>
