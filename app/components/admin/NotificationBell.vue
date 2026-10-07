<script setup lang="ts">
const { items, unread, markRead } = useAdminNotifications()
const router = useRouter()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

onClickOutside(root, () => (open.value = false))
useEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Escape') open.value = false })

async function go(n: { id: string; link: string | null; readAt: string | null }) {
  if (!n.readAt) await markRead(n.id).catch(() => {})
  open.value = false
  if (n.link) router.push(n.link)
}
</script>

<template>
  <div ref="root" class="relative">
    <button type="button" class="btn btn-ghost btn-icon relative" :aria-label="`Notifications${unread ? `, ${unread} unread` : ''}`" aria-haspopup="true" :aria-expanded="open" @click="open = !open">
      <AppIcon name="bell" :size="22" />
      <span v-if="unread" class="absolute right-1 top-1 grid min-w-[1.15rem] place-items-center rounded-full bg-accent px-1 text-[0.65rem] font-bold leading-[1.15rem] text-white">{{ unread > 9 ? '9+' : unread }}</span>
    </button>

    <Transition name="pop">
      <div v-if="open" class="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white shadow-lift max-sm:fixed max-sm:inset-x-4 max-sm:top-16 max-sm:w-auto">
        <div class="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 class="text-sm font-semibold text-ink">Notifications</h2>
          <button type="button" class="text-sm font-medium text-accent hover:underline disabled:opacity-40" :disabled="!unread" @click="markRead()">Mark all as read</button>
        </div>
        <ul class="max-h-96 divide-y divide-line overflow-y-auto">
          <li v-for="n in items" :key="n.id">
            <button type="button" class="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-surface" @click="go(n)">
              <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" :class="n.readAt ? 'bg-transparent' : 'bg-accent'" />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-semibold text-ink">{{ n.title }}</span>
                <span v-if="n.body" class="mt-0.5 line-clamp-2 block text-sm text-muted">{{ n.body }}</span>
                <span class="mt-1 block text-xs text-muted">{{ timeAgo(n.createdAt) }}</span>
              </span>
            </button>
          </li>
          <li v-if="!items.length" class="px-4 py-10 text-center text-sm text-muted">You’re all caught up.</li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
