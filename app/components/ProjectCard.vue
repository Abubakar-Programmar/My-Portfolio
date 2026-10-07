<script setup lang="ts">
defineProps<{
  project: { slug: string; title: string; summary: string; client: string | null; year: number | null; coverImage: string | null; techStack: string[] }
  index?: number
}>()
</script>

<template>
  <article v-reveal="(index ?? 0) * 80" class="group relative">
    <div class="aspect-[3/2] overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 group-hover:shadow-lift">
      <AppImage :src="project.coverImage" :alt="`${project.title} preview`" :width="800" :height="533" sizes="(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
    </div>
    <div class="mt-5">
      <p class="text-sm font-medium text-muted">{{ [project.client, project.year].filter(Boolean).join(' · ') }}</p>
      <h3 class="mt-1 text-xl sm:text-2xl">
        <NuxtLink :to="`/projects/${project.slug}`" class="after:absolute after:inset-0 after:content-['']">{{ project.title }}</NuxtLink>
      </h3>
      <p class="mt-2 text-muted">{{ project.summary }}</p>
      <ul class="mt-4 flex flex-wrap gap-2" aria-label="Technologies">
        <li v-for="t in project.techStack.slice(0, 4)" :key="t" class="badge badge-gray">{{ t }}</li>
      </ul>
    </div>
  </article>
</template>
