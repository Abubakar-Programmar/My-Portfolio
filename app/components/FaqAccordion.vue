<script setup lang="ts">
defineProps<{ items: { question: string; answer: string }[] }>()
</script>

<template>
  <div class="divide-y divide-line rounded-2xl border border-line bg-white">
    <details v-for="(item, i) in items" :key="item.question" class="group p-5 sm:p-6" :open="i === 0">
      <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {{ item.question }}
        <AppIcon name="chevron-down" class="text-accent transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <p class="mt-3 max-w-3xl text-muted">{{ item.answer }}</p>
    </details>
  </div>
</template>
