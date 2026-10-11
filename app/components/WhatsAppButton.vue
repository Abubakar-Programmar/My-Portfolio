<script setup lang="ts">
// Floating WhatsApp chat button, shown on public pages when a WhatsApp number is configured.
const site = useSite()
const href = computed(() => whatsappUrl(site.value.contact.whatsapp))
</script>

<template>
  <a
    v-if="site.contact.whatsapp"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="group fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lift transition duration-300 hover:-translate-y-1 hover:scale-105 sm:bottom-6 sm:right-6"
    aria-label="Chat with me on WhatsApp"
  >
    <span class="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-[#25D366]" aria-hidden="true" />
    <AppIcon name="whatsapp" :size="28" />
    <span class="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-cream opacity-0 transition group-hover:opacity-100 sm:block">Chat on WhatsApp</span>
  </a>
</template>
