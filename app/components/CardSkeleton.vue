<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 3 })
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
    <div v-for="n in count" :key="n" class="card overflow-hidden">
      <div class="skeleton aspect-[3/2] rounded-none" />
      <div class="space-y-3 p-6">
        <div class="skeleton h-5 w-1/3" />
        <div class="skeleton h-6 w-3/4" />
        <div class="skeleton h-4 w-full" />
        <div class="skeleton h-4 w-2/3" />
      </div>
    </div>
  </div>
</template>
