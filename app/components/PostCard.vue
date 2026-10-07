<script setup lang="ts">
defineProps<{
  post: { slug: string; title: string; excerpt: string; coverImage: string | null; publishedAt: string | null; readingMinutes: number; categoryName?: string | null }
  index?: number
}>()
</script>

<template>
  <article v-reveal="(index ?? 0) * 80" class="card card-hover group relative flex h-full flex-col overflow-hidden">
    <div class="aspect-[16/10] overflow-hidden bg-surface">
      <AppImage :src="post.coverImage" :alt="`Cover image for ${post.title}`" :width="640" :height="400" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
    </div>
    <div class="flex flex-1 flex-col p-6">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        <span v-if="post.categoryName" class="badge badge-accent">{{ post.categoryName }}</span>
        <time :datetime="post.publishedAt ?? undefined">{{ formatDate(post.publishedAt) }}</time>
        <span aria-hidden="true">·</span>
        <span>{{ post.readingMinutes }} min read</span>
      </div>
      <h3 class="mt-3 text-xl">
        <NuxtLink :to="`/blog/${post.slug}`" class="after:absolute after:inset-0 after:content-['']">{{ post.title }}</NuxtLink>
      </h3>
      <p class="mt-2 line-clamp-3 flex-1 text-muted">{{ post.excerpt }}</p>
    </div>
  </article>
</template>
