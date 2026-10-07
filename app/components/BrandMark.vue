<script setup lang="ts">
const site = useSite()
const name = computed(() => site.value.general.siteTitle)
</script>

<template>
  <NuxtLink to="/" class="group inline-flex items-center gap-2.5" :aria-label="`${name} — home`">
    <AppImage v-if="site.general.logo" :src="site.general.logo" :alt="name" :width="36" :height="36" loading="eager" class="h-9 w-9 rounded-xl object-contain" />
    <span v-else class="grid h-9 w-9 place-items-center rounded-xl bg-accent text-sm font-extrabold text-white transition-transform duration-300 group-hover:rotate-6">
      {{ initials(name) }}
    </span>
    <span class="font-display text-lg font-bold tracking-tight text-ink">{{ name }}</span>
  </NuxtLink>
</template>
