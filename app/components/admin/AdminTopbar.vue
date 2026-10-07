<script setup lang="ts">
defineEmits<{ menu: [] }>()
const { user, clear } = useUserSession()
const router = useRouter()
const toast = useToast()

const query = ref('')
const results = ref<{ group: string; label: string; to: string }[]>([])
const searchOpen = ref(false)
const profileOpen = ref(false)
const searchRoot = ref<HTMLElement | null>(null)
const profileRoot = ref<HTMLElement | null>(null)

onClickOutside(searchRoot, () => (searchOpen.value = false))
onClickOutside(profileRoot, () => (profileOpen.value = false))

watch(query, useDebounceFn(async (q: string) => {
  if (q.trim().length < 2) { results.value = []; return }
  results.value = await $fetch('/api/admin/search', { query: { q: q.trim() } }).catch(() => [])
  searchOpen.value = true
}, 250))

function go(to: string) {
  searchOpen.value = false
  query.value = ''
  router.push(to)
}

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
  await clear()
  toast.success('Signed out')
  await navigateTo('/admin/login')
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-xl sm:px-6">
    <button type="button" class="btn btn-ghost btn-icon lg:hidden" aria-label="Open navigation" @click="$emit('menu')"><AppIcon name="menu" /></button>

    <div ref="searchRoot" class="relative max-w-md flex-1">
      <label for="admin-search" class="sr-only">Search the admin</label>
      <AppIcon name="search" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
      <input id="admin-search" v-model="query" type="search" class="input h-10 rounded-full bg-surface pl-10" placeholder="Search services, posts, messages…" autocomplete="off" @focus="searchOpen = results.length > 0">
      <Transition name="pop">
        <ul v-if="searchOpen && results.length" class="absolute left-0 right-0 top-12 z-50 max-h-80 overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-lift">
          <li v-for="r in results" :key="r.to">
            <button type="button" class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-surface" @click="go(r.to)">
              <span class="truncate font-medium text-ink">{{ r.label }}</span>
              <span class="shrink-0 text-xs uppercase tracking-wider text-muted">{{ r.group }}</span>
            </button>
          </li>
        </ul>
      </Transition>
    </div>

    <div class="ml-auto flex items-center gap-1.5">
      <AdminNotificationBell />
      <div ref="profileRoot" class="relative">
        <button type="button" class="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-surface" aria-haspopup="true" :aria-expanded="profileOpen" @click="profileOpen = !profileOpen">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-bold text-white">{{ initials(user?.name ?? 'A') }}</span>
          <AppIcon name="chevron-down" :size="16" class="hidden text-muted sm:block" />
          <span class="sr-only">Account menu</span>
        </button>
        <Transition name="pop">
          <div v-if="profileOpen" class="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
            <div class="border-b border-line px-4 py-3">
              <p class="truncate font-semibold text-ink">{{ user?.name }}</p>
              <p class="truncate text-sm text-muted">{{ user?.email }}</p>
            </div>
            <div class="p-1.5">
              <NuxtLink to="/admin/security" class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium hover:bg-surface" @click="profileOpen = false"><AppIcon name="lock" :size="18" /> Security</NuxtLink>
              <NuxtLink to="/admin/profile" class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium hover:bg-surface" @click="profileOpen = false"><AppIcon name="user" :size="18" /> Profile</NuxtLink>
              <button type="button" class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-danger hover:bg-red-50" @click="logout"><AppIcon name="log-out" :size="18" /> Sign out</button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>
