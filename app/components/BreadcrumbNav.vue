<script setup lang="ts">
defineProps<{ items: { name: string; to?: string }[] }>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="text-sm text-muted">
    <ol class="flex flex-wrap items-center gap-1.5">
      <li><NuxtLink to="/" class="transition hover:text-accent">Home</NuxtLink></li>
      <li v-for="(item, i) in items" :key="item.name" class="flex items-center gap-1.5">
        <AppIcon name="chevron-right" :size="14" />
        <NuxtLink v-if="item.to && i < items.length - 1" :to="item.to" class="transition hover:text-accent">{{ item.name }}</NuxtLink>
        <span v-else class="font-medium text-ink" aria-current="page">{{ item.name }}</span>
      </li>
    </ol>
  </nav>
</template>
