<script setup lang="ts">
const { data } = await useFetch('/api/testimonials', { key: 'testimonials' })

usePageSeo({
  title: 'Client Testimonials',
  description: 'What clients say about working together: faster websites, more organic traffic and smooth, honest communication.',
  breadcrumbs: [{ name: 'Testimonials', path: '/testimonials' }]
})
</script>

<template>
  <div>
    <section class="pt-32 sm:pt-36">
      <div class="container-x">
        <BreadcrumbNav :items="[{ name: 'Testimonials' }]" class="hero-in" />
        <h1 class="h1 hero-in mt-5 max-w-3xl" style="--i: 1">Kind words from <span class="gradient-text">happy clients</span></h1>
        <p class="lead hero-in mt-5 max-w-2xl" style="--i: 2">The best part of the job is the feedback after launch.</p>
      </div>
    </section>

    <section class="section pt-12">
      <div class="container-x">
        <ul class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <li v-for="(t, i) in data ?? []" :key="t.id" v-reveal="(i % 3) * 80" class="card flex h-full flex-col justify-between p-7 shadow-soft">
            <figure class="flex h-full flex-col justify-between">
              <div>
                <div class="flex gap-0.5 text-amber-500" role="img" :aria-label="`${t.rating} out of 5 stars`"><AppIcon v-for="n in t.rating" :key="n" name="star-filled" :size="18" /></div>
                <blockquote class="mt-4 text-lg leading-relaxed text-ink">“{{ t.quote }}”</blockquote>
              </div>
              <figcaption class="mt-6 flex items-center gap-3">
                <span class="grid h-11 w-11 place-items-center rounded-full bg-accent-soft font-bold text-accent-dark" aria-hidden="true">{{ initials(t.name) }}</span>
                <div><div class="font-semibold text-ink">{{ t.name }}</div><div class="text-sm text-muted">{{ [t.role, t.company].filter(Boolean).join(', ') }}</div></div>
              </figcaption>
            </figure>
          </li>
        </ul>
        <div class="mt-14 text-center"><NuxtLink to="/contact" class="btn btn-primary">Become the next success story <AppIcon name="arrow-right" :size="18" /></NuxtLink></div>
      </div>
    </section>
  </div>
</template>
