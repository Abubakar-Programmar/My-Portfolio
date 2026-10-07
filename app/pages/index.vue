<script setup lang="ts">
const site = useSite()
const { data } = await useFetch('/api/home', { key: 'home' })

usePageSeo(() => ({
  title: `${site.value.profile.name} — ${site.value.profile.role}`,
  description: site.value.general.siteDescription,
  schema: [{ '@type': 'ProfessionalService', name: site.value.profile.name, description: site.value.general.siteDescription, url: absoluteUrl('/') }]
}))

const stats = computed(() => [
  { label: 'Years of experience', value: site.value.profile.yearsExperience, suffix: '+' },
  { label: 'Projects delivered', value: site.value.profile.projectsCompleted, suffix: '+' },
  { label: 'Happy clients', value: site.value.profile.happyClients, suffix: '+' }
])
const skillNames = computed(() => (data.value?.skills ?? []).map(s => s.name))
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden pt-32 sm:pt-36 lg:pt-40">
      <div class="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden="true" />
      <div class="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-accent-ring/30 blur-3xl" aria-hidden="true" />
      <div class="container-x relative grid items-center gap-12 pb-16 lg:grid-cols-12 lg:pb-24">
        <div class="lg:col-span-7">
          <div class="hero-in" style="--i: 0"><AvailabilityBadge /></div>
          <h1 class="h1 hero-in mt-6" style="--i: 1">
            Hi, I’m {{ site.profile.name }}.<br>
            <span class="gradient-text">{{ site.profile.role }}</span>
          </h1>
          <p class="lead hero-in mt-6 max-w-2xl" style="--i: 2">{{ site.profile.pitch }}</p>
          <div class="hero-in mt-9 flex flex-wrap gap-3" style="--i: 3">
            <NuxtLink to="/projects" class="btn btn-primary">View my work <AppIcon name="arrow-right" :size="18" /></NuxtLink>
            <NuxtLink to="/contact" class="btn btn-secondary">Hire me</NuxtLink>
          </div>
          <dl class="hero-in mt-12 grid max-w-lg grid-cols-3 gap-6" style="--i: 4">
            <div v-for="s in stats" :key="s.label">
              <dt class="text-sm text-muted">{{ s.label }}</dt>
              <dd class="mt-1 font-display text-3xl font-extrabold text-ink">{{ s.value }}{{ s.suffix }}</dd>
            </div>
          </dl>
        </div>

        <div class="hero-in relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none" style="--i: 2">
          <div class="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-accent-soft shadow-lift">
            <AppImage :src="site.profile.photo" :alt="`Portrait of ${site.profile.name}`" :width="800" :height="1000" priority sizes="(min-width: 1024px) 460px, 90vw" class="h-full w-full object-cover" />
          </div>
          <div class="absolute -left-4 bottom-10 animate-float rounded-2xl border border-line bg-white px-4 py-3 shadow-lift sm:-left-8">
            <div class="text-xs text-muted">Projects delivered</div>
            <div class="font-display text-2xl font-extrabold text-success">{{ site.profile.projectsCompleted }}+</div>
          </div>
          <div class="absolute -right-3 top-8 animate-float rounded-2xl border border-line bg-white px-4 py-3 shadow-lift [animation-delay:-3s] sm:-right-6">
            <div class="text-xs text-muted">Experience</div>
            <div class="font-display text-2xl font-extrabold text-accent">{{ site.profile.yearsExperience }}+ yrs</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills strip -->
    <section v-if="skillNames.length" class="border-y border-line bg-paper py-5" aria-label="Skills">
      <div class="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <ul class="marquee flex w-max gap-10 whitespace-nowrap">
          <li v-for="(n, i) in [...skillNames, ...skillNames]" :key="`${n}-${i}`" :aria-hidden="i >= skillNames.length ? 'true' : undefined" class="flex items-center gap-10 font-display text-lg font-semibold text-muted">
            {{ n }} <span class="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          </li>
        </ul>
      </div>
    </section>

    <!-- Services -->
    <section class="section">
      <div class="container-x">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Services" title="What I can do for you" text="End-to-end digital services — from the first wireframe to the first page-one ranking." />
          <NuxtLink to="/services" class="btn btn-secondary">All services <AppIcon name="arrow-right" :size="16" /></NuxtLink>
        </div>
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard v-for="(s, i) in data?.services ?? []" :key="s.id" :service="s" :index="i" />
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="bg-accent-soft py-14" aria-label="Numbers">
      <div class="container-x grid gap-8 text-center sm:grid-cols-3">
        <div v-for="s in stats" :key="s.label" v-reveal>
          <div class="font-display text-5xl font-extrabold text-accent-dark sm:text-6xl"><AnimatedCounter :to="s.value" :suffix="s.suffix" /></div>
          <div class="mt-2 font-medium text-body">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- Projects -->
    <section class="section">
      <div class="container-x">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Selected work" title="Projects with measurable results" text="Case studies that show the problem, the solution and the numbers that changed." />
          <NuxtLink to="/projects" class="btn btn-secondary">All projects <AppIcon name="arrow-right" :size="16" /></NuxtLink>
        </div>
        <div class="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
          <ProjectCard v-for="(p, i) in data?.projects ?? []" :key="p.id" :project="p" :index="i % 2" />
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section v-if="data?.testimonials.length" class="section bg-paper">
      <div class="container-x">
        <SectionHeading eyebrow="Kind words" title="What clients say" align="center" />
        <div v-reveal class="mt-12"><TestimonialCarousel :items="data.testimonials" /></div>
        <p class="mt-6 text-center"><NuxtLink to="/testimonials" class="font-semibold text-accent hover:underline">Read all testimonials</NuxtLink></p>
      </div>
    </section>

    <!-- Blog -->
    <section v-if="data?.posts.length" class="section">
      <div class="container-x">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Blog" title="Latest from the blog" text="Practical notes on SEO, performance and building for the web." />
          <NuxtLink to="/blog" class="btn btn-secondary">All articles <AppIcon name="arrow-right" :size="16" /></NuxtLink>
        </div>
        <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PostCard v-for="(p, i) in data.posts" :key="p.id" :post="p" :index="i" />
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="section pt-0">
      <div class="container-x">
        <div v-reveal class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-accent-dark px-6 py-14 text-center sm:px-12 sm:py-20">
          <div class="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
          <div class="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent-ring/40 blur-3xl" aria-hidden="true" />
          <div class="relative">
            <h2 class="h2 text-white">{{ site.profile.ctaTitle }}</h2>
            <p class="mx-auto mt-4 max-w-xl text-lg text-white/80">{{ site.profile.ctaText }}</p>
            <div class="mt-9 flex flex-wrap justify-center gap-3">
              <NuxtLink to="/contact" class="btn bg-white text-accent-dark hover:-translate-y-0.5 hover:shadow-lift">Start a project <AppIcon name="arrow-right" :size="18" /></NuxtLink>
              <a v-if="site.contact.whatsapp" :href="`https://wa.me/${site.contact.whatsapp}`" target="_blank" rel="noopener noreferrer" class="btn border border-white/30 text-white hover:bg-white/10">
                <AppIcon name="whatsapp" :size="18" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
