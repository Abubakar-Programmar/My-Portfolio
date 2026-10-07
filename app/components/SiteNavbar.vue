<script setup lang="ts">
const route = useRoute()
const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 8)
const drawerOpen = ref(false)
const palette = useCommandPalette()

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' }
]

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path === to || route.path.startsWith(`${to}/`))

watch(() => route.fullPath, () => (drawerOpen.value = false))

// Lock page scroll while the mobile drawer is open.
const locked = useScrollLock(import.meta.client ? document.body : null)
watch(drawerOpen, v => (locked.value = v))
onBeforeUnmount(() => (locked.value = false))
useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') drawerOpen.value = false
})
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-40 transition-all duration-300"
    :class="scrolled ? 'border-b border-line bg-white/85 shadow-[0_1px_0_rgba(15,18,32,.03)] backdrop-blur-xl' : 'border-b border-transparent bg-transparent'"
  >
    <div class="container-x flex h-[4.5rem] items-center justify-between gap-6">
      <BrandMark />

      <nav class="hidden items-center gap-8 md:flex" aria-label="Primary">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="nav-link" :class="{ 'is-active': isActive(l.to) }" :aria-current="isActive(l.to) ? 'page' : undefined">
          {{ l.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <button type="button" class="btn btn-ghost btn-icon hidden lg:inline-flex" aria-label="Open command palette (Ctrl+K)" @click="palette.toggle()">
          <AppIcon name="search" />
        </button>
        <NuxtLink to="/contact" class="btn btn-primary btn-sm hidden sm:inline-flex">Hire me <AppIcon name="arrow-right" :size="16" /></NuxtLink>
        <button
          type="button"
          class="btn btn-secondary btn-icon md:hidden"
          :aria-expanded="drawerOpen"
          aria-controls="mobile-drawer"
          aria-label="Open menu"
          @click="drawerOpen = true"
        >
          <AppIcon name="menu" />
        </button>
      </div>
    </div>
  </header>

  <ClientOnly><Teleport to="body">
    <Transition name="drawer">
      <div v-if="drawerOpen" class="fixed inset-0 z-50 md:hidden">
        <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="drawerOpen = false" />
        <div id="mobile-drawer" class="drawer-panel absolute right-0 top-0 flex h-full w-[min(22rem,88vw)] flex-col bg-white p-6 shadow-lift" role="dialog" aria-modal="true" aria-label="Menu">
          <div class="flex items-center justify-between">
            <span class="font-display text-lg font-bold text-ink">Menu</span>
            <button type="button" class="btn btn-ghost btn-icon" aria-label="Close menu" @click="drawerOpen = false"><AppIcon name="x" /></button>
          </div>
          <nav class="mt-6 flex flex-1 flex-col gap-1" aria-label="Mobile">
            <NuxtLink
              v-for="(l, i) in links"
              :key="l.to"
              :to="l.to"
              class="hero-in flex items-center justify-between rounded-xl px-4 py-3.5 text-lg font-semibold transition-colors"
              :class="isActive(l.to) ? 'bg-accent-soft text-accent-dark' : 'text-ink hover:bg-surface'"
              :style="{ '--i': i }"
            >
              {{ l.label }} <AppIcon name="chevron-right" :size="18" />
            </NuxtLink>
          </nav>
          <NuxtLink to="/contact" class="btn btn-primary w-full">Hire me <AppIcon name="arrow-right" :size="16" /></NuxtLink>
        </div>
      </div>
    </Transition>
  </Teleport></ClientOnly>
</template>
