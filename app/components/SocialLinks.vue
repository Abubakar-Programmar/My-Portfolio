<script setup lang="ts">
withDefaults(defineProps<{ items: { label: string; url: string }[]; size?: number }>(), { size: 18 })

function iconFor(label: string, url: string): string {
  const key = `${label} ${url}`.toLowerCase()
  const map: [string, string][] = [
    ['github', 'github'], ['linkedin', 'linkedin'], ['twitter', 'twitter'], ['x.com', 'twitter'], ['facebook', 'facebook'],
    ['instagram', 'instagram'], ['youtube', 'youtube'], ['whatsapp', 'whatsapp'], ['mail', 'mail']
  ]
  return map.find(([k]) => key.includes(k))?.[1] ?? 'globe'
}
</script>

<template>
  <ul v-if="items.length" class="flex flex-wrap items-center gap-2">
    <li v-for="s in items" :key="s.url">
      <a :href="s.url" target="_blank" rel="noopener noreferrer me" class="grid h-10 w-10 place-items-center rounded-full border border-line text-body transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-white" :aria-label="s.label">
        <AppIcon :name="iconFor(s.label, s.url)" :size="size" />
      </a>
    </li>
  </ul>
</template>
