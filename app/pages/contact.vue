<script setup lang="ts">
const site = useSite()

usePageSeo(() => ({
  title: 'Contact',
  description: `Tell ${site.value.profile.name} about your project. Get a clear reply within five working hours.`,
  breadcrumbs: [{ name: 'Contact', path: '/contact' }],
  schema: [{ '@type': 'ContactPage', name: 'Contact', url: absoluteUrl('/contact') }]
}))

const channels = computed(() => [
  site.value.contact.email && { icon: 'mail', label: 'Email', value: site.value.contact.email, href: `mailto:${site.value.contact.email}` },
  site.value.contact.whatsapp && { icon: 'whatsapp', label: 'WhatsApp', value: `+${site.value.contact.whatsapp}`, href: whatsappUrl(site.value.contact.whatsapp) },
  site.value.contact.phone && { icon: 'phone', label: 'Phone', value: site.value.contact.phone, href: `tel:${site.value.contact.phone.replace(/\s/g, '')}` },
  site.value.contact.location && { icon: 'map-pin', label: 'Location', value: site.value.contact.location, href: null }
].filter((c): c is { icon: string; label: string; value: string; href: string | null } => Boolean(c)))
</script>

<template>
  <div>
    <section class="relative overflow-hidden pt-32 sm:pt-36">
      <div class="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-accent-ring/25 blur-3xl" aria-hidden="true" />
      <div class="container-x relative pb-20 lg:pb-28">
        <BreadcrumbNav :items="[{ name: 'Contact' }]" class="hero-in" />
        <h1 class="h1 hero-in mt-5 max-w-3xl" style="--i: 1">Let’s talk about your <span class="gradient-text">project</span></h1>
        <p class="lead hero-in mt-5 max-w-2xl" style="--i: 2">Share a few details and I will get back to you within five working hours with next steps.</p>

        <div class="mt-12 grid gap-10 lg:grid-cols-12">
          <aside class="hero-in space-y-6 lg:col-span-4" style="--i: 3">
            <AvailabilityBadge />
            <ul class="space-y-4">
              <li v-for="c in channels" :key="c.label" class="flex items-start gap-4">
                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-dark"><AppIcon :name="c.icon" /></span>
                <div class="min-w-0">
                  <p class="text-sm text-muted">{{ c.label }}</p>
                  <a v-if="c.href" :href="c.href" class="text-[0.9rem] font-semibold text-ink transition [overflow-wrap:anywhere] hover:text-accent sm:text-base" :target="c.href.startsWith('http') ? '_blank' : undefined" rel="noopener noreferrer">{{ c.value }}</a>
                  <p v-else class="font-semibold text-ink">{{ c.value }}</p>
                </div>
              </li>
            </ul>
            <div v-if="site.socials.items.length">
              <p class="mb-3 text-sm text-muted">Find me online</p>
              <SocialLinks :items="site.socials.items" />
            </div>
          </aside>
          <div class="hero-in lg:col-span-8" style="--i: 3"><ContactForm /></div>
        </div>
      </div>
    </section>
  </div>
</template>
