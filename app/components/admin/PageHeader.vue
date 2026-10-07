<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-0">
      <h1 class="font-display text-2xl font-bold text-ink sm:text-3xl">{{ title }}</h1>
      <p v-if="description" class="mt-1 max-w-2xl text-muted">{{ description }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2"><slot /></div>
  </div>
</template>
