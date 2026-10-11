<template>
  <div class="flex min-h-screen flex-col">
    <a href="#main" class="sr-only z-[80] rounded-full bg-accent px-5 py-2.5 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
    <BackgroundFx />
    <ScrollProgress />
    <SiteNavbar />
    <main id="main" class="flex-1" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
    <WhatsAppButton />
    <ClientOnly><CommandPalette /></ClientOnly>
  </div>
</template>
