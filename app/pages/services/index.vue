<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const search = ref(String(route.query.q ?? ''))
const category = ref(String(route.query.category ?? ''))
const sort = ref<'featured' | 'newest' | 'name'>('featured')
const debouncedSearch = refDebounced(search, 250)

const { data, status } = useFetch('/api/services', {
  key: 'services-list',
  query: computed(() => ({ q: debouncedSearch.value || undefined, category: category.value || undefined, sort: sort.value })),
  lazy: true
})

watch([debouncedSearch, category], () => router.replace({ query: { q: debouncedSearch.value || undefined, category: category.value || undefined } }))

usePageSeo({
  title: 'Services',
  description: 'Web development, technical SEO, e-commerce, performance optimisation and ongoing support — digital services built to rank and convert.',
  breadcrumbs: [{ name: 'Services', path: '/services' }]
})
</script>

<template>
  <div>
    <section class="pt-32 sm:pt-36">
      <div class="container-x">
        <BreadcrumbNav :items="[{ name: 'Services' }]" class="hero-in" />
        <h1 class="h1 hero-in mt-5 max-w-3xl" style="--i: 1">Services built to make your website <span class="gradient-text">work harder</span></h1>
        <p class="lead hero-in mt-5 max-w-2xl" style="--i: 2">Pick a service, or tell me what you need and I will shape a plan around your goals.</p>
      </div>
    </section>

    <section class="section pt-12">
      <div class="container-x">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button type="button" class="badge px-4 py-2 text-sm transition" :class="!category ? 'bg-accent text-white' : 'bg-surface text-body hover:bg-accent-soft'" :aria-pressed="!category" @click="category = ''">All</button>
            <button v-for="c in data?.categories ?? []" :key="c.id" type="button" class="badge px-4 py-2 text-sm transition" :class="category === c.slug ? 'bg-accent text-white' : 'bg-surface text-body hover:bg-accent-soft'" :aria-pressed="category === c.slug" @click="category = c.slug">{{ c.name }}</button>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row">
            <div class="relative sm:w-64">
              <label for="service-search" class="sr-only">Search services</label>
              <AppIcon name="search" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input id="service-search" v-model="search" type="search" class="input pl-10" placeholder="Search services…">
            </div>
            <div>
              <label for="service-sort" class="sr-only">Sort services</label>
              <select id="service-sort" v-model="sort" class="input sm:w-44">
                <option value="featured">Featured first</option>
                <option value="newest">Newest</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mt-10" aria-live="polite">
          <CardSkeleton v-if="status === 'pending' && !data" :count="6" />
          <div v-else-if="data?.items.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" :class="{ 'opacity-60 transition': status === 'pending' }">
            <ServiceCard v-for="(s, i) in data.items" :key="s.id" :service="s" :index="i % 3" />
          </div>
          <div v-else class="card p-12 text-center">
            <p class="text-lg font-semibold text-ink">No services match your search.</p>
            <button type="button" class="btn btn-secondary mt-5" @click="search = ''; category = ''">Clear filters</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
