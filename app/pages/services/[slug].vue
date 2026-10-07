<script setup lang="ts">
const route = useRoute()
const site = useSite()
const slug = computed(() => String(route.params.slug))
const { data: service, error } = await useFetch(() => `/api/services/${slug.value}`, { key: `service-${slug.value}` })
if (error.value || !service.value) throw createError({ statusCode: 404, statusMessage: 'Service not found', fatal: true })

const s = computed(() => service.value!)
const quoteLink = computed(() => ({ path: '/contact', query: { service: s.value.slug } }))

usePageSeo(() => ({
  title: s.value.seoTitle || s.value.title,
  description: s.value.seoDescription || s.value.summary,
  image: s.value.coverImage,
  breadcrumbs: [{ name: 'Services', path: '/services' }, { name: s.value.title, path: `/services/${s.value.slug}` }],
  schema: [
    {
      '@type': 'Service',
      name: s.value.title,
      description: s.value.seoDescription || s.value.summary,
      url: absoluteUrl(`/services/${s.value.slug}`),
      image: absoluteUrl(s.value.coverImage),
      serviceType: s.value.categoryName ?? s.value.title,
      areaServed: 'Worldwide',
      provider: { '@type': 'Person', name: site.value.profile.name, url: absoluteUrl('/') }
    },
    ...(s.value.faqs.length
      ? [{ '@type': 'FAQPage', mainEntity: s.value.faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }]
      : [])
  ]
}))

const gallery = computed(() => (s.value.images.length ? s.value.images : [s.value.coverImage]).filter((x): x is string => Boolean(x)))
</script>

<template>
  <article>
    <header class="relative overflow-hidden pt-32 sm:pt-36">
      <div class="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-accent-ring/25 blur-3xl" aria-hidden="true" />
      <div class="container-x relative grid items-center gap-10 pb-14 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <BreadcrumbNav :items="[{ name: 'Services', to: '/services' }, { name: s.title }]" class="hero-in" />
          <div class="hero-in mt-6 flex items-center gap-3" style="--i: 1">
            <span class="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-dark"><AppIcon :name="s.icon" :size="24" /></span>
            <span v-if="s.categoryName" class="badge badge-accent">{{ s.categoryName }}</span>
          </div>
          <h1 class="h1 hero-in mt-5" style="--i: 2">{{ s.title }}</h1>
          <p class="lead hero-in mt-5" style="--i: 3">{{ s.summary }}</p>
          <div class="hero-in mt-8 flex flex-wrap items-center gap-3" style="--i: 4">
            <NuxtLink :to="quoteLink" class="btn btn-primary">Request a quote <AppIcon name="arrow-right" :size="18" /></NuxtLink>
            <ShareButtons :title="s.title" :path="`/services/${s.slug}`" class="ml-1" />
          </div>
          <dl class="hero-in mt-10 flex flex-wrap gap-x-10 gap-y-4" style="--i: 5">
            <div v-if="s.turnaround"><dt class="flex items-center gap-1.5 text-sm text-muted"><AppIcon name="clock" :size="15" /> Turnaround</dt><dd class="mt-0.5 font-semibold text-ink">{{ s.turnaround }}</dd></div>
            <div v-if="s.showPricing && s.startingPrice"><dt class="flex items-center gap-1.5 text-sm text-muted"><AppIcon name="tag" :size="15" /> Starting from</dt><dd class="mt-0.5 font-semibold text-ink">{{ s.startingPrice }}</dd></div>
          </dl>
        </div>
        <div class="hero-in lg:col-span-5" style="--i: 2">
          <div class="aspect-[3/2] overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
            <AppImage :src="s.coverImage" :alt="`${s.title} illustration`" :width="900" :height="600" priority sizes="(min-width: 1024px) 480px, 100vw" class="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </header>

    <div class="container-x grid gap-14 py-12 lg:grid-cols-12 lg:py-20">
      <div class="space-y-16 lg:col-span-8">
        <section v-if="s.overview" aria-labelledby="overview-h">
          <h2 id="overview-h" class="sr-only">Overview</h2>
          <div class="prose-content" v-html="s.overview" />
        </section>

        <section v-if="s.deliverables.length" aria-labelledby="deliverables-h">
          <h2 id="deliverables-h" class="h2 text-2xl sm:text-3xl">What’s included</h2>
          <ul class="mt-6 grid gap-3 sm:grid-cols-2">
            <li v-for="(d, i) in s.deliverables" :key="d" v-reveal="(i % 6) * 50" class="flex gap-3 rounded-xl border border-line bg-white p-4">
              <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green-50 text-success"><AppIcon name="check" :size="14" /></span>
              <span class="text-ink">{{ d }}</span>
            </li>
          </ul>
        </section>

        <section v-if="s.processSteps.length" aria-labelledby="process-h">
          <h2 id="process-h" class="h2 text-2xl sm:text-3xl">How we’ll work together</h2>
          <ol class="mt-8 space-y-6">
            <li v-for="(step, i) in s.processSteps" :key="step.title" v-reveal="i * 60" class="flex gap-5">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent font-display text-lg font-bold text-white">{{ i + 1 }}</span>
              <div class="pt-1">
                <h3 class="text-lg">{{ step.title }}</h3>
                <p class="mt-1 text-muted">{{ step.description }}</p>
              </div>
            </li>
          </ol>
        </section>

        <section v-if="gallery.length > 1" aria-labelledby="gallery-h">
          <h2 id="gallery-h" class="h2 text-2xl sm:text-3xl">Gallery</h2>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div v-for="(img, i) in gallery" :key="img" v-reveal="{ image: true, delay: i * 80 }" class="aspect-[3/2] overflow-hidden rounded-2xl border border-line bg-surface">
              <AppImage :src="img" :alt="`${s.title} — example ${i + 1}`" :width="720" :height="480" sizes="(min-width: 1024px) 400px, 100vw" class="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        <section v-if="s.showPricing && s.packages.length" aria-labelledby="pricing-h">
          <h2 id="pricing-h" class="h2 text-2xl sm:text-3xl">Packages & pricing</h2>
          <div class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div v-for="(p, i) in s.packages" :key="p.name" v-reveal="i * 70" class="card flex flex-col p-6" :class="i === 1 && s.packages.length > 2 ? 'border-accent shadow-glow' : ''">
              <h3 class="text-lg">{{ p.name }}</h3>
              <p class="mt-2 font-display text-3xl font-extrabold text-ink">{{ p.price }}</p>
              <p class="mt-2 text-sm text-muted">{{ p.description }}</p>
              <ul class="mt-5 flex-1 space-y-2.5 text-sm">
                <li v-for="f in p.features" :key="f" class="flex gap-2"><AppIcon name="check" :size="16" class="mt-0.5 text-success" /> {{ f }}</li>
              </ul>
              <NuxtLink :to="quoteLink" class="btn btn-secondary mt-6 w-full">Choose {{ p.name }}</NuxtLink>
            </div>
          </div>
          <p class="mt-4 text-sm text-muted">Prices are starting points. Every project gets a fixed written quote after a short call.</p>
        </section>

        <section v-if="s.faqs.length" aria-labelledby="faq-h">
          <h2 id="faq-h" class="h2 text-2xl sm:text-3xl">Frequently asked questions</h2>
          <div class="mt-6"><FaqAccordion :items="s.faqs" /></div>
        </section>
      </div>

      <aside class="lg:col-span-4">
        <div class="space-y-6 lg:sticky lg:top-28">
          <div class="card p-6 shadow-soft">
            <h2 class="text-xl">Ready to get started?</h2>
            <p class="mt-2 text-muted">Tell me about your project and get a clear quote within one business day.</p>
            <NuxtLink :to="quoteLink" class="btn btn-primary mt-5 w-full">Request a quote</NuxtLink>
          </div>
          <div v-if="s.tools.length" class="card p-6">
            <h2 class="text-lg">Tools & technologies</h2>
            <ul class="mt-4 flex flex-wrap gap-2"><li v-for="t in s.tools" :key="t" class="badge badge-gray">{{ t }}</li></ul>
          </div>
        </div>
      </aside>
    </div>

    <section v-if="s.caseStudies.length" class="section bg-paper">
      <div class="container-x">
        <SectionHeading eyebrow="Proof" title="Related case studies" />
        <div class="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          <ProjectCard v-for="(p, i) in s.caseStudies" :key="p.id" :project="p" :index="i" />
        </div>
      </div>
    </section>

    <section v-if="s.related.length" class="section">
      <div class="container-x">
        <SectionHeading eyebrow="More services" title="Related services" />
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard v-for="(r, i) in s.related" :key="r.id" :service="r" :index="i" />
        </div>
      </div>
    </section>
  </article>
</template>
