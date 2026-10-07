<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data: project, error } = await useFetch(() => `/api/projects/${slug.value}`, { key: `project-${slug.value}` })
if (error.value || !project.value) throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
const p = computed(() => project.value!)

usePageSeo(() => ({
  title: p.value.seoTitle || p.value.title,
  description: p.value.seoDescription || p.value.summary,
  image: p.value.coverImage,
  breadcrumbs: [{ name: 'Projects', path: '/projects' }, { name: p.value.title, path: `/projects/${p.value.slug}` }],
  schema: [{ '@type': 'CreativeWork', name: p.value.title, description: p.value.summary, image: absoluteUrl(p.value.coverImage), url: absoluteUrl(`/projects/${p.value.slug}`), keywords: p.value.techStack.join(', '), dateCreated: p.value.year ? String(p.value.year) : undefined }]
}))
</script>

<template>
  <article>
    <header class="pt-32 sm:pt-36">
      <div class="container-x">
        <BreadcrumbNav :items="[{ name: 'Projects', to: '/projects' }, { name: p.title }]" class="hero-in" />
        <h1 class="h1 hero-in mt-5 max-w-4xl" style="--i: 1">{{ p.title }}</h1>
        <p class="lead hero-in mt-5 max-w-3xl" style="--i: 2">{{ p.summary }}</p>
        <div class="hero-in mt-8 flex flex-wrap gap-3" style="--i: 3">
          <a v-if="p.liveUrl" :href="p.liveUrl" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">Visit live site <AppIcon name="external-link" :size="16" /></a>
          <a v-if="p.githubUrl" :href="p.githubUrl" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm"><AppIcon name="github" :size="16" /> Source code</a>
        </div>
        <div class="hero-in mt-10 aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-surface shadow-lift" style="--i: 4">
          <AppImage :src="p.coverImage" :alt="`${p.title} screenshot`" :width="1400" :height="875" priority sizes="(min-width: 1280px) 1216px, 100vw" class="h-full w-full object-cover" />
        </div>
      </div>
    </header>

    <div class="container-x grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
      <aside class="lg:col-span-4">
        <dl class="card space-y-5 p-6 lg:sticky lg:top-28">
          <div v-if="p.client"><dt class="text-sm text-muted">Client</dt><dd class="font-semibold text-ink">{{ p.client }}</dd></div>
          <div v-if="p.year"><dt class="text-sm text-muted">Year</dt><dd class="font-semibold text-ink">{{ p.year }}</dd></div>
          <div v-if="p.serviceSlug"><dt class="text-sm text-muted">Service</dt><dd><NuxtLink :to="`/services/${p.serviceSlug}`" class="font-semibold text-accent hover:underline">{{ p.serviceTitle }}</NuxtLink></dd></div>
          <div v-if="p.techStack.length">
            <dt class="text-sm text-muted">Tech stack</dt>
            <dd class="mt-2 flex flex-wrap gap-2"><span v-for="t in p.techStack" :key="t" class="badge badge-gray">{{ t }}</span></dd>
          </div>
        </dl>
      </aside>

      <div class="space-y-14 lg:col-span-8">
        <section v-if="p.problem" aria-labelledby="problem-h">
          <h2 id="problem-h" class="h2 text-2xl sm:text-3xl">The problem</h2>
          <div class="prose-content mt-4" v-html="p.problem" />
        </section>
        <section v-if="p.solution" aria-labelledby="solution-h">
          <h2 id="solution-h" class="h2 text-2xl sm:text-3xl">The solution</h2>
          <div class="prose-content mt-4" v-html="p.solution" />
        </section>

        <section v-if="p.results.length" aria-labelledby="results-h">
          <h2 id="results-h" class="h2 text-2xl sm:text-3xl">Results</h2>
          <ul class="mt-6 grid gap-4 sm:grid-cols-2">
            <li v-for="(r, i) in p.results" :key="r.label" v-reveal="i * 70" class="card p-6">
              <p class="text-sm font-medium text-muted">{{ r.label }}</p>
              <p class="mt-3 flex flex-wrap items-baseline gap-x-3">
                <span v-if="r.before" class="text-lg text-muted line-through decoration-1">{{ r.before }}</span>
                <AppIcon v-if="r.before" name="arrow-right" :size="18" class="self-center text-accent" />
                <span class="font-display text-3xl font-extrabold text-accent-dark">{{ r.after }}</span>
              </p>
            </li>
          </ul>
        </section>

        <section v-if="p.gallery.length" aria-labelledby="gallery-h">
          <h2 id="gallery-h" class="h2 text-2xl sm:text-3xl">Screenshots</h2>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div v-for="(img, i) in p.gallery" :key="img" v-reveal="{ image: true, delay: i * 80 }" class="aspect-[3/2] overflow-hidden rounded-2xl border border-line bg-surface">
              <AppImage :src="img" :alt="`${p.title} — screenshot ${i + 1}`" :width="720" :height="480" sizes="(min-width: 1024px) 400px, 100vw" class="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        <ShareButtons :title="p.title" :path="`/projects/${p.slug}`" />
      </div>
    </div>

    <section v-if="p.more.length" class="section bg-paper">
      <div class="container-x">
        <SectionHeading eyebrow="Keep exploring" title="More projects" />
        <div class="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2"><ProjectCard v-for="(m, i) in p.more" :key="m.id" :project="m" :index="i" /></div>
      </div>
    </section>
  </article>
</template>
