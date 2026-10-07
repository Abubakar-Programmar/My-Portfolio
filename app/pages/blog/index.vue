<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const site = useSite()

const search = ref(String(route.query.q ?? ''))
const debounced = refDebounced(search, 300)
const query = computed(() => ({
  q: debounced.value || undefined,
  category: (route.query.category as string) || undefined,
  tag: (route.query.tag as string) || undefined,
  page: Number(route.query.page) > 1 ? Number(route.query.page) : undefined
}))

const { data, status } = useFetch('/api/blog', { key: 'blog-list', query, lazy: true, watch: [query] })
const totalPages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / (data.value?.pageSize ?? 9))))

function setQuery(patch: Record<string, string | number | undefined>) {
  router.push({ query: { ...route.query, page: undefined, ...patch } })
}
watch(debounced, v => setQuery({ q: v || undefined }))

const activeCategory = computed(() => data.value?.categories.find(c => c.slug === query.value.category))
usePageSeo(() => ({
  title: activeCategory.value ? `${activeCategory.value.name} articles` : 'Blog',
  description: 'Practical articles on technical SEO, Core Web Vitals and building fast websites with Nuxt and Vue.',
  breadcrumbs: [{ name: 'Blog', path: '/blog' }],
  noindex: Boolean(query.value.q || query.value.page)
}))
</script>

<template>
  <div>
    <section class="pt-32 sm:pt-36">
      <div class="container-x">
        <BreadcrumbNav :items="[{ name: 'Blog' }]" class="hero-in" />
        <div class="mt-5 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 class="h1 hero-in max-w-3xl" style="--i: 1">Notes on SEO, speed & <span class="gradient-text">web craft</span></h1>
            <p class="lead hero-in mt-5 max-w-2xl" style="--i: 2">Plain-language guides you can apply the same day.</p>
          </div>
          <a href="/rss.xml" class="btn btn-secondary btn-sm hero-in" style="--i: 3"><AppIcon name="rss" :size="16" /> RSS feed</a>
        </div>
      </div>
    </section>

    <section class="section pt-12">
      <div class="container-x">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button type="button" class="badge px-4 py-2 text-sm transition" :class="!query.category ? 'bg-accent text-white' : 'bg-surface text-body hover:bg-accent-soft'" @click="setQuery({ category: undefined })">All</button>
            <button v-for="c in data?.categories ?? []" :key="c.id" type="button" class="badge px-4 py-2 text-sm transition" :class="query.category === c.slug ? 'bg-accent text-white' : 'bg-surface text-body hover:bg-accent-soft'" @click="setQuery({ category: c.slug })">{{ c.name }}</button>
          </div>
          <div class="relative lg:w-72">
            <label for="blog-search" class="sr-only">Search articles</label>
            <AppIcon name="search" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input id="blog-search" v-model="search" type="search" class="input pl-10" placeholder="Search articles…">
          </div>
        </div>
        <div v-if="data?.tags.length" class="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span class="font-medium text-ink">Topics:</span>
          <button v-for="t in data.tags" :key="t.id" type="button" class="rounded-full px-3 py-1 transition" :class="query.tag === t.slug ? 'bg-ink text-white' : 'text-muted hover:bg-surface hover:text-ink'" @click="setQuery({ tag: query.tag === t.slug ? undefined : t.slug })">#{{ t.name }}</button>
        </div>

        <div class="mt-10" aria-live="polite">
          <CardSkeleton v-if="status === 'pending' && !data" :count="6" />
          <div v-else-if="data?.items.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" :class="{ 'opacity-60 transition': status === 'pending' }">
            <PostCard v-for="(p, i) in data.items" :key="p.id" :post="p" :index="i % 3" />
          </div>
          <div v-else class="card p-12 text-center">
            <p class="text-lg font-semibold text-ink">No articles found.</p>
            <button type="button" class="btn btn-secondary mt-5" @click="search = ''; router.push({ query: {} })">Clear filters</button>
          </div>
        </div>

        <nav v-if="totalPages > 1" class="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
          <button type="button" class="btn btn-secondary btn-sm" :disabled="(query.page ?? 1) <= 1" @click="setQuery({ page: (query.page ?? 1) - 1 || undefined })"><AppIcon name="arrow-left" :size="16" /> Previous</button>
          <span class="px-3 text-sm text-muted">Page {{ query.page ?? 1 }} of {{ totalPages }}</span>
          <button type="button" class="btn btn-secondary btn-sm" :disabled="(query.page ?? 1) >= totalPages" @click="setQuery({ page: (query.page ?? 1) + 1 })">Next <AppIcon name="arrow-right" :size="16" /></button>
        </nav>

        <div v-if="site.subscribersEnabled" class="mt-16 rounded-3xl bg-accent-soft p-8 sm:p-12">
          <div class="mx-auto max-w-xl text-center">
            <h2 class="h2 text-2xl sm:text-3xl">Get new articles in your inbox</h2>
            <p class="mt-3 text-muted">One short email when a new post is published. No spam, unsubscribe any time.</p>
            <div class="relative mt-6 text-left"><NewsletterForm /></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
