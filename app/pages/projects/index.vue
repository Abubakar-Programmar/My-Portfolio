<script setup lang="ts">
const { data, status } = useFetch('/api/projects', { key: 'projects-list', lazy: true })
const filter = ref('')

const filters = computed(() => {
  const map = new Map<string, string>()
  for (const p of data.value?.items ?? []) if (p.serviceSlug && p.serviceTitle) map.set(p.serviceSlug, p.serviceTitle)
  return [...map.entries()].map(([slug, title]) => ({ slug, title }))
})
const items = computed(() => (data.value?.items ?? []).filter(p => !filter.value || p.serviceSlug === filter.value))

usePageSeo({
  title: 'Projects & Case Studies',
  description: 'Selected projects with the problem, the solution and the measurable results — faster sites, more organic traffic, more leads.',
  breadcrumbs: [{ name: 'Projects', path: '/projects' }]
})
</script>

<template>
  <div>
    <section class="pt-32 sm:pt-36">
      <div class="container-x">
        <BreadcrumbNav :items="[{ name: 'Projects' }]" class="hero-in" />
        <h1 class="h1 hero-in mt-5 max-w-3xl" style="--i: 1">Work that moves <span class="gradient-text">real numbers</span></h1>
        <p class="lead hero-in mt-5 max-w-2xl" style="--i: 2">Each case study covers the challenge, what I built and the before-and-after metrics.</p>
      </div>
    </section>

    <section class="section pt-12">
      <div class="container-x">
        <div v-if="filters.length" class="flex flex-wrap gap-2" role="group" aria-label="Filter by service">
          <button type="button" class="badge px-4 py-2 text-sm transition" :class="!filter ? 'bg-accent text-white' : 'bg-surface text-body hover:bg-accent-soft'" :aria-pressed="!filter" @click="filter = ''">All</button>
          <button v-for="f in filters" :key="f.slug" type="button" class="badge px-4 py-2 text-sm transition" :class="filter === f.slug ? 'bg-accent text-white' : 'bg-surface text-body hover:bg-accent-soft'" :aria-pressed="filter === f.slug" @click="filter = f.slug">{{ f.title }}</button>
        </div>

        <div class="mt-10">
          <CardSkeleton v-if="status === 'pending' && !data" :count="4" />
          <div v-else-if="items.length" class="grid gap-x-8 gap-y-14 md:grid-cols-2">
            <ProjectCard v-for="(p, i) in items" :key="p.id" :project="p" :index="i % 2" />
          </div>
          <p v-else class="card p-12 text-center text-lg font-semibold text-ink">No projects in this category yet.</p>
        </div>
      </div>
    </section>
  </div>
</template>
