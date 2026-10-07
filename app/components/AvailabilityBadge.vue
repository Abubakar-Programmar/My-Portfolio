<script setup lang="ts">
const site = useSite()
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium"
    :class="site.profile.availability ? 'border-green-200 bg-green-50 text-success' : 'border-line bg-surface text-muted'"
  >
    <span class="relative flex h-2.5 w-2.5">
      <span v-if="site.profile.availability" class="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
      <span class="relative inline-flex h-2.5 w-2.5 rounded-full" :class="site.profile.availability ? 'bg-success' : 'bg-muted'" />
    </span>
    {{ site.profile.availability ? site.profile.availabilityText : 'Currently booked' }}
  </span>
</template>
