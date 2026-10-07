<script setup lang="ts">
defineProps<{
  service: {
    slug: string; title: string; summary: string; icon: string; coverImage: string | null
    showPricing: boolean; startingPrice: string | null; turnaround: string | null; categoryName?: string | null
  }
  index?: number
}>()
</script>

<template>
  <article v-reveal="(index ?? 0) * 80" class="card card-hover group relative flex h-full flex-col overflow-hidden">
    <div class="aspect-[3/2] overflow-hidden bg-surface">
      <AppImage :src="service.coverImage" :alt="`${service.title} preview`" :width="600" :height="400" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
    </div>
    <div class="flex flex-1 flex-col p-6">
      <div class="flex items-center gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-dark transition group-hover:bg-accent group-hover:text-white"><AppIcon :name="service.icon" /></span>
        <span v-if="service.categoryName" class="badge badge-gray">{{ service.categoryName }}</span>
      </div>
      <h3 class="mt-4 text-xl">
        <NuxtLink :to="`/services/${service.slug}`" class="after:absolute after:inset-0 after:content-['']">{{ service.title }}</NuxtLink>
      </h3>
      <p class="mt-2 flex-1 text-muted">{{ service.summary }}</p>
      <div class="mt-5 flex items-center justify-between text-sm">
        <span class="font-semibold text-ink">{{ service.showPricing && service.startingPrice ? service.startingPrice : service.turnaround || 'Request a quote' }}</span>
        <span class="inline-flex items-center gap-1 font-semibold text-accent">Learn more <AppIcon name="arrow-right" :size="16" class="transition group-hover:translate-x-1" /></span>
      </div>
    </div>
  </article>
</template>
