<script setup lang="ts">
const route = useRoute()
const site = useSite()
const slug = computed(() => String(route.params.slug))
const { data: post, error } = await useFetch(() => `/api/blog/${slug.value}`, { key: `post-${slug.value}` })
if (error.value || !post.value) throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
const p = computed(() => post.value!)

usePageSeo(() => ({
  title: p.value.seoTitle || p.value.title,
  description: p.value.seoDescription || p.value.excerpt,
  image: p.value.coverImage,
  type: 'article',
  publishedAt: p.value.publishedAt,
  breadcrumbs: [{ name: 'Blog', path: '/blog' }, { name: p.value.title, path: `/blog/${p.value.slug}` }]
}))
useSchemaOrg([
  defineArticle({
    headline: () => p.value.title,
    description: () => p.value.seoDescription || p.value.excerpt,
    image: () => absoluteUrl(p.value.coverImage),
    datePublished: () => p.value.publishedAt ?? undefined,
    dateModified: () => p.value.updatedAt,
    author: { name: site.value.profile.name }
  })
])
</script>

<template>
  <article>
    <header class="pt-32 sm:pt-36">
      <div class="container-x max-w-4xl">
        <BreadcrumbNav :items="[{ name: 'Blog', to: '/blog' }, { name: p.title }]" class="hero-in" />
        <div class="hero-in mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted" style="--i: 1">
          <NuxtLink v-if="p.categorySlug" :to="{ path: '/blog', query: { category: p.categorySlug } }" class="badge badge-accent">{{ p.categoryName }}</NuxtLink>
          <time :datetime="p.publishedAt ?? undefined">{{ formatDate(p.publishedAt, { year: 'numeric', month: 'long', day: 'numeric' }) }}</time>
          <span aria-hidden="true">·</span>
          <span class="inline-flex items-center gap-1"><AppIcon name="clock" :size="15" /> {{ p.readingMinutes }} min read</span>
        </div>
        <h1 class="h1 hero-in mt-5 !text-4xl sm:!text-5xl" style="--i: 2">{{ p.title }}</h1>
        <p class="lead hero-in mt-5" style="--i: 3">{{ p.excerpt }}</p>
      </div>
      <div class="container-x mt-10 max-w-5xl">
        <div class="hero-in aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-surface shadow-lift" style="--i: 4">
          <AppImage :src="p.coverImage" :alt="`Cover image for ${p.title}`" :width="1200" :height="675" priority sizes="(min-width: 1024px) 1024px, 100vw" class="h-full w-full object-cover" />
        </div>
      </div>
    </header>

    <div class="container-x grid max-w-6xl gap-12 py-12 lg:grid-cols-12 lg:py-16">
      <div class="lg:col-span-8">
        <div class="prose-content" v-html="p.content" />
        <div v-if="p.tags.length" class="mt-10 flex flex-wrap gap-2">
          <NuxtLink v-for="t in p.tags" :key="t.slug" :to="{ path: '/blog', query: { tag: t.slug } }" class="badge badge-gray transition hover:bg-accent-soft">#{{ t.name }}</NuxtLink>
        </div>
        <div class="mt-8 border-t border-line pt-8"><ShareButtons :title="p.title" :path="`/blog/${p.slug}`" /></div>

        <div class="card mt-10 flex items-start gap-5 p-6">
          <AppImage :src="site.profile.photo" :alt="site.profile.name" :width="72" :height="72" class="h-[4.5rem] w-[4.5rem] rounded-2xl bg-accent-soft object-cover" />
          <div>
            <p class="text-sm text-muted">Written by</p>
            <p class="font-display text-lg font-bold text-ink">{{ site.profile.name }}</p>
            <p class="mt-1 text-muted">{{ site.profile.shortBio }}</p>
            <NuxtLink to="/contact" class="mt-3 inline-block font-semibold text-accent hover:underline">Work with me →</NuxtLink>
          </div>
        </div>
      </div>

      <aside class="hidden lg:col-span-4 lg:block">
        <div class="sticky top-28"><TableOfContents :items="p.toc" /></div>
      </aside>
    </div>

    <section v-if="p.related.length" class="section bg-paper">
      <div class="container-x">
        <SectionHeading eyebrow="Keep reading" title="Related articles" />
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><PostCard v-for="(r, i) in p.related" :key="r.id" :post="r" :index="i" /></div>
      </div>
    </section>
  </article>
</template>
