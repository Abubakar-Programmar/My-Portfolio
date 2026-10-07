<script setup lang="ts">
const site = useSite()
const { data } = await useFetch('/api/about', { key: 'about' })

usePageSeo(() => ({
  title: `About ${site.value.profile.name}`,
  description: site.value.profile.shortBio,
  image: site.value.profile.photo,
  breadcrumbs: [{ name: 'About', path: '/about' }]
}))

const bio = computed(() => paragraphs(site.value.profile.bio || site.value.profile.shortBio))
const groups = computed(() => {
  const map = new Map<string, NonNullable<typeof data.value>['skills']>()
  for (const s of data.value?.skills ?? []) map.set(s.category, [...(map.get(s.category) ?? []), s])
  return [...map.entries()].map(([category, items]) => ({ category, items }))
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden pt-32 sm:pt-36">
      <div class="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-accent-ring/25 blur-3xl" aria-hidden="true" />
      <div class="container-x relative grid items-center gap-12 pb-16 lg:grid-cols-12 lg:pb-24">
        <div class="order-2 lg:order-1 lg:col-span-7">
          <BreadcrumbNav :items="[{ name: 'About' }]" class="hero-in" />
          <h1 class="h1 hero-in mt-5" style="--i: 1">The person behind the pixels and the rankings</h1>
          <div class="hero-in mt-6 space-y-4 text-lg leading-relaxed text-body" style="--i: 2">
            <p v-for="p in bio" :key="p">{{ p }}</p>
          </div>
          <div class="hero-in mt-8 flex flex-wrap items-center gap-3" style="--i: 3">
            <AvailabilityBadge />
            <a v-if="site.profile.resume" :href="site.profile.resume" class="btn btn-secondary btn-sm" target="_blank" rel="noopener" download><AppIcon name="download" :size="16" /> Download resume</a>
            <NuxtLink to="/contact" class="btn btn-primary btn-sm">Work with me</NuxtLink>
          </div>
        </div>
        <div class="hero-in order-1 mx-auto w-full max-w-xs lg:order-2 lg:col-span-5 lg:max-w-sm" style="--i: 1">
          <div class="aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-accent-soft shadow-lift">
            <AppImage :src="site.profile.photo" :alt="`Portrait of ${site.profile.name}`" :width="800" :height="1000" priority sizes="(min-width: 1024px) 380px, 80vw" class="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <section class="section bg-paper">
      <div class="container-x">
        <SectionHeading eyebrow="Skills" title="What I’m good at" text="Depth in the full stack, plus the SEO know-how to make it all discoverable." />
        <div class="mt-12 grid gap-6 md:grid-cols-2">
          <div v-for="(g, gi) in groups" :key="g.category" v-reveal="gi * 70" class="card p-6 sm:p-7">
            <h3 class="text-xl">{{ g.category }}</h3>
            <ul class="mt-5 space-y-4">
              <li v-for="s in g.items" :key="s.id">
                <div class="flex items-center justify-between text-sm font-medium text-ink"><span>{{ s.name }}</span><span class="text-muted">{{ s.level }}%</span></div>
                <div class="mt-2 h-2 overflow-hidden rounded-full bg-surface" role="progressbar" :aria-valuenow="s.level" aria-valuemin="0" aria-valuemax="100" :aria-label="s.name">
                  <div class="h-full rounded-full bg-gradient-to-r from-accent to-accent-ring" :style="{ width: `${s.level}%` }" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience & education -->
    <section class="section">
      <div class="container-x grid gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Experience" title="Where I’ve worked" />
          <ol class="mt-10 space-y-8 border-l-2 border-line pl-7">
            <li v-for="(e, i) in data?.experiences ?? []" :key="e.id" v-reveal="i * 70" class="relative">
              <span class="absolute -left-[2.15rem] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent bg-white" aria-hidden="true" />
              <p class="text-sm font-semibold text-accent">{{ dateRange(e.startDate, e.endDate) }}</p>
              <h3 class="mt-1 text-lg">{{ e.role }}</h3>
              <p class="text-muted">{{ e.company }}<template v-if="e.location"> · {{ e.location }}</template></p>
              <p v-if="e.description" class="mt-2">{{ e.description }}</p>
            </li>
          </ol>
        </div>
        <div>
          <SectionHeading eyebrow="Education" title="Learning & credentials" />
          <ol class="mt-10 space-y-8 border-l-2 border-line pl-7">
            <li v-for="(e, i) in data?.educations ?? []" :key="e.id" v-reveal="i * 70" class="relative">
              <span class="absolute -left-[2.15rem] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-accent bg-white" aria-hidden="true" />
              <p class="text-sm font-semibold text-accent">{{ dateRange(e.startDate, e.endDate) }}</p>
              <h3 class="mt-1 text-lg">{{ e.degree }}</h3>
              <p class="text-muted">{{ e.institution }}</p>
              <p v-if="e.description" class="mt-2">{{ e.description }}</p>
            </li>
          </ol>
          <div v-if="data?.certifications.length" class="mt-12">
            <h3 class="text-xl">Certifications</h3>
            <ul class="mt-4 space-y-3">
              <li v-for="c in data.certifications" :key="c.id" class="card flex items-center gap-4 p-4">
                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-dark"><AppIcon name="award" /></span>
                <div class="min-w-0">
                  <p class="font-semibold text-ink">{{ c.name }}</p>
                  <p class="text-sm text-muted">{{ c.issuer }}<template v-if="c.year"> · {{ c.year }}</template></p>
                </div>
                <a v-if="c.url" :href="c.url" target="_blank" rel="noopener noreferrer" class="ml-auto text-accent" :aria-label="`View ${c.name}`"><AppIcon name="external-link" :size="18" /></a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section pt-0">
      <div class="container-x">
        <div v-reveal class="rounded-3xl bg-accent-soft px-6 py-12 text-center sm:py-16">
          <h2 class="h2">Let’s build something that gets found</h2>
          <p class="lead mx-auto mt-3 max-w-xl">{{ site.profile.ctaText }}</p>
          <NuxtLink to="/contact" class="btn btn-primary mt-8">Get in touch <AppIcon name="arrow-right" :size="18" /></NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
