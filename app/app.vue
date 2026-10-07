<script setup lang="ts">
const site = useSite()
const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
const maintenance = computed(() => site.value.general.maintenance && !isAdmin.value)

// Maintenance mode answers with 503 so search engines do not index the placeholder.
if (import.meta.server && maintenance.value) setResponseStatus(useRequestEvent()!, 503)

useHead({
  titleTemplate: title => (title && title !== site.value.general.siteTitle ? `${title} | ${site.value.general.siteTitle}` : site.value.general.siteTitle),
  link: computed(() => [{ rel: 'icon', href: site.value.general.favicon || '/favicon.svg' }])
})
useSeoMeta({ ogSiteName: () => site.value.general.siteTitle })

if (!isAdmin.value) {
  useSchemaOrg(computed(() => [
    definePerson({
      name: site.value.profile.name,
      jobTitle: site.value.profile.role,
      description: site.value.profile.shortBio,
      image: absoluteUrl(site.value.profile.photo),
      sameAs: site.value.socials.items.map(s => s.url),
      email: site.value.contact.email || undefined
    })
  ]))
}
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="#5B3DF5" :height="3" :throttle="300" />
    <MaintenanceScreen v-if="maintenance" />
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly><ConfirmModal /></ClientOnly>
    <ClientOnly><ToastContainer /></ClientOnly>
  </div>
</template>
