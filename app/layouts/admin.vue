<script setup lang="ts">
const route = useRoute()
const drawer = ref(false)
const notifications = useAdminNotifications()

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }], titleTemplate: t => (t ? `${t} · Admin` : 'Admin') })

onMounted(() => notifications.connect())
onBeforeUnmount(() => notifications.disconnect())
watch(() => route.fullPath, () => (drawer.value = false))
// Keep the sidebar unread badge honest as messages are read elsewhere.
watch(() => route.path, () => notifications.refresh().catch(() => {}))
</script>

<template>
  <div class="min-h-screen bg-paper">
    <a href="#admin-main" class="sr-only z-[80] rounded-full bg-accent px-5 py-2.5 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>

    <aside class="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-white lg:block"><AdminSidebar /></aside>

    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawer" class="fixed inset-0 z-50 lg:hidden">
          <div class="absolute inset-0 bg-ink/40 backdrop-blur-sm" @click="drawer = false" />
          <div class="drawer-panel absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-lift" style="transform-origin: left">
            <AdminSidebar @navigate="drawer = false" />
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="lg:pl-64">
      <AdminTopbar @menu="drawer = true" />
      <main id="admin-main" class="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8" tabindex="-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<style>
/* The admin drawer slides in from the left. */
.drawer-enter-from .drawer-panel[style*='origin: left'],
.drawer-leave-to .drawer-panel[style*='origin: left'] { transform: translateX(-100%); }
</style>
