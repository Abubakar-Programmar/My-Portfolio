<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Inbox' })

type Row = { id: string; name: string; email: string; serviceName: string | null; body: string; status: string; starred: boolean; createdAt: string }
const toast = useToast()
const views = [
  { key: 'inbox', label: 'Inbox' }, { key: 'unread', label: 'Unread' }, { key: 'starred', label: 'Starred' },
  { key: 'archived', label: 'Archived' }, { key: 'spam', label: 'Spam' }
] as const

const view = ref<(typeof views)[number]['key']>('inbox')
const search = ref('')
const service = ref('')
const from = ref('')
const to = ref('')
const page = ref(1)
const selected = ref<string[]>([])
const debounced = refDebounced(search, 300)
watch([view, debounced, service, from, to], () => { page.value = 1; selected.value = [] })

const query = computed(() => ({ view: view.value, q: debounced.value || undefined, service: service.value || undefined, from: from.value || undefined, to: to.value || undefined, page: page.value, pageSize: 20 }))
const { data, status, refresh } = useFetch<{ items: Row[]; total: number; pageSize: number; counts: Record<string, number> }>('/api/admin/messages', { query, key: 'admin-inbox' })
const { data: services } = useFetch<{ items: { id: string; title: string }[] }>('/api/admin/services', { query: { pageSize: 100 }, key: 'inbox-services' })
const { refresh: refreshBadges } = useAdminNotifications()

const pages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / 20)))
const allSelected = computed(() => !!data.value?.items.length && selected.value.length === data.value.items.length)
const toggleAll = () => (selected.value = allSelected.value ? [] : (data.value?.items.map(i => i.id) ?? []))
const exportUrl = computed(() => `/api/admin/messages/export?${new URLSearchParams(Object.fromEntries(Object.entries(query.value).filter(([k, v]) => v !== undefined && k !== 'page' && k !== 'pageSize').map(([k, v]) => [k, String(v)]))).toString()}`)

async function bulk(action: 'read' | 'unread' | 'archive' | 'spam' | 'star' | 'unstar' | 'delete') {
  if (!selected.value.length) return
  if (action === 'delete') {
    const ok = await useConfirm().confirm({ title: `Delete ${selected.value.length} message(s)?`, message: 'This cannot be undone.', confirmLabel: 'Delete', danger: true })
    if (!ok) return
  }
  try {
    await $fetch('/api/admin/messages/bulk', { method: 'POST', body: { ids: selected.value, action } })
    toast.success('Updated')
    selected.value = []
    await Promise.all([refresh(), refreshBadges()])
  } catch (err) { toast.error(errorMessage(err)) }
}

async function toggleStar(row: Row) {
  await $fetch(`/api/admin/messages/${row.id}`, { method: 'PATCH', body: { starred: !row.starred } }).catch(err => toast.error(errorMessage(err)))
  await refresh()
}
</script>

<template>
  <div>
    <AdminPageHeader title="Inbox" description="Messages and quote requests from the contact form.">
      <a :href="exportUrl" class="btn btn-secondary btn-sm" download><AppIcon name="download" :size="16" /> Export CSV</a>
    </AdminPageHeader>

    <div class="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Message views">
      <button v-for="v in views" :key="v.key" type="button" role="tab" :aria-selected="view === v.key" class="badge px-4 py-2 text-sm transition" :class="view === v.key ? 'bg-accent text-white' : 'bg-white text-body ring-1 ring-line hover:bg-accent-soft'" @click="view = v.key">
        {{ v.label }}<span v-if="data?.counts[v.key]" class="rounded-full px-1.5 text-xs" :class="view === v.key ? 'bg-white/25' : 'bg-surface'">{{ data.counts[v.key] }}</span>
      </button>
    </div>

    <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div class="relative lg:col-span-1">
        <label for="inbox-q" class="sr-only">Search messages</label>
        <AppIcon name="search" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input id="inbox-q" v-model="search" type="search" class="input pl-10" placeholder="Search name, email, text…">
      </div>
      <select v-model="service" class="input" aria-label="Filter by service"><option value="">All services</option><option v-for="s in services?.items ?? []" :key="s.id" :value="s.id">{{ s.title }}</option></select>
      <input v-model="from" type="date" class="input" aria-label="From date">
      <input v-model="to" type="date" class="input" aria-label="To date">
    </div>

    <Transition name="fade">
      <div v-if="selected.length" class="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-accent-soft px-4 py-2.5 text-sm">
        <span class="font-semibold text-accent-dark">{{ selected.length }} selected</span>
        <button type="button" class="btn btn-secondary btn-sm" @click="bulk('read')">Mark read</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="bulk('unread')">Mark unread</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="bulk('star')">Star</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="bulk('archive')">Archive</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="bulk('spam')">Spam</button>
        <button type="button" class="btn btn-danger btn-sm" @click="bulk('delete')">Delete</button>
      </div>
    </Transition>

    <div class="card overflow-hidden">
      <div v-if="data?.items.length" class="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
        <input type="checkbox" class="h-4 w-4 accent-[#5B3DF5]" :checked="allSelected" aria-label="Select all messages" @change="toggleAll">
        <span>{{ data.total }} message{{ data.total === 1 ? '' : 's' }}</span>
      </div>
      <ul class="divide-y divide-line">
        <template v-if="status === 'pending' && !data"><li v-for="n in 6" :key="n" class="p-4"><div class="skeleton h-12" /></li></template>
        <li v-for="m in data?.items ?? []" :key="m.id" class="flex items-start gap-3 px-4 py-3.5 transition hover:bg-paper" :class="m.status === 'unread' ? 'bg-accent-soft/40' : ''">
          <input v-model="selected" type="checkbox" :value="m.id" class="mt-1.5 h-4 w-4 accent-[#5B3DF5]" :aria-label="`Select message from ${m.name}`">
          <button type="button" class="mt-0.5 shrink-0" :class="m.starred ? 'text-amber-500' : 'text-line hover:text-amber-400'" :aria-label="m.starred ? 'Unstar' : 'Star'" @click="toggleStar(m)"><AppIcon :name="m.starred ? 'star-filled' : 'star'" :size="18" /></button>
          <NuxtLink :to="`/admin/inbox/${m.id}`" class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="truncate" :class="m.status === 'unread' ? 'font-bold text-ink' : 'font-medium text-ink'">{{ m.name }}</span>
              <span class="truncate text-sm text-muted">{{ m.email }}</span>
              <span v-if="m.serviceName" class="badge badge-accent">{{ m.serviceName }}</span>
              <AdminStatusBadge v-if="m.status === 'spam' || m.status === 'archived'" :status="m.status" />
            </div>
            <p class="mt-1 line-clamp-1 text-sm text-body">{{ m.body }}</p>
          </NuxtLink>
          <time class="shrink-0 whitespace-nowrap text-xs text-muted" :datetime="m.createdAt">{{ timeAgo(m.createdAt) }}</time>
        </li>
      </ul>
      <div v-if="data && !data.items.length" class="px-6 py-16 text-center">
        <AppIcon name="inbox" :size="36" class="mx-auto text-muted" /><p class="mt-3 font-semibold text-ink">Nothing here</p><p class="text-sm text-muted">No messages match this view.</p>
      </div>
    </div>

    <nav v-if="pages > 1" class="mt-4 flex items-center justify-end gap-2 text-sm text-muted" aria-label="Pagination">
      <button type="button" class="btn btn-secondary btn-sm" :disabled="page <= 1" @click="page--">Previous</button>
      <span>Page {{ page }} / {{ pages }}</span>
      <button type="button" class="btn btn-secondary btn-sm" :disabled="page >= pages" @click="page++">Next</button>
    </nav>
  </div>
</template>
