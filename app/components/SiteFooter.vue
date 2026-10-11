<script setup lang="ts">
const site = useSite()
const year = new Date().getFullYear()
const quick = [
  { label: 'Home', to: '/' }, { label: 'About', to: '/about' }, { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' }, { label: 'Blog', to: '/blog' }, { label: 'Contact', to: '/contact' }
]
const legal = [{ label: 'Privacy Policy', to: '/privacy' }, { label: 'Terms of Service', to: '/terms' }, { label: 'Testimonials', to: '/testimonials' }]

function toTop() {
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
</script>

<template>
  <footer class="border-t border-line bg-paper">
    <div class="container-x grid gap-12 py-14 md:grid-cols-12">
      <div class="md:col-span-4">
        <BrandMark />
        <p class="mt-4 max-w-sm text-muted">{{ site.profile.shortBio }}</p>
        <div class="mt-6"><SocialLinks :items="site.socials.items" /></div>
      </div>

      <nav class="md:col-span-2" aria-label="Quick links">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-ink">Explore</h2>
        <ul class="mt-4 space-y-2.5">
          <li v-for="l in quick" :key="l.to"><NuxtLink :to="l.to" class="text-muted transition hover:text-accent">{{ l.label }}</NuxtLink></li>
        </ul>
      </nav>

      <nav class="md:col-span-2" aria-label="Legal">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-ink">More</h2>
        <ul class="mt-4 space-y-2.5">
          <li v-for="l in legal" :key="l.to"><NuxtLink :to="l.to" class="text-muted transition hover:text-accent">{{ l.label }}</NuxtLink></li>
          <li><a href="/rss.xml" class="inline-flex items-center gap-1.5 text-muted transition hover:text-accent"><AppIcon name="rss" :size="15" /> RSS feed</a></li>
        </ul>
      </nav>

      <div class="md:col-span-4">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-ink">Get in touch</h2>
        <ul class="mt-4 space-y-2.5 text-muted">
          <li v-if="site.contact.email"><a :href="`mailto:${site.contact.email}`" class="inline-flex items-start gap-2 break-words text-[0.95rem] transition hover:text-accent"><AppIcon name="mail" :size="16" class="mt-1" /> {{ site.contact.email }}</a></li>
          <li v-if="site.contact.phone"><a :href="`tel:${site.contact.phone.replace(/\s/g, '')}`" class="inline-flex items-center gap-2 transition hover:text-accent"><AppIcon name="phone" :size="16" /> {{ site.contact.phone }}</a></li>
          <li v-if="site.contact.location" class="inline-flex items-center gap-2"><AppIcon name="map-pin" :size="16" /> {{ site.contact.location }}</li>
        </ul>
        <NuxtLink to="/contact" class="btn btn-primary btn-sm mt-5">Start a project</NuxtLink>
      </div>
    </div>

    <div class="border-t border-line">
      <div class="container-x flex flex-col items-center justify-between gap-3 py-6 text-sm text-muted sm:flex-row">
        <p>© {{ year }} {{ site.profile.name }}. All rights reserved.</p>
        <button type="button" class="inline-flex items-center gap-2 font-medium text-ink transition hover:text-accent" @click="toTop">
          Back to top <AppIcon name="arrow-up" :size="16" />
        </button>
      </div>
    </div>
  </footer>
</template>
