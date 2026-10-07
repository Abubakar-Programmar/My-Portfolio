<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Dashboard' })

const { data, status } = useFetch('/api/admin/dashboard', { key: 'admin-dashboard' })
const { user } = useUserSession()

const cards = computed(() => {
  const s = data.value?.stats
  if (!s) return []
  const delta = s.viewsPrev ? Math.round(((s.viewsWeek - s.viewsPrev) / s.viewsPrev) * 100) : null
  return [
    { label: 'Total messages', value: s.totalMessages, icon: 'message', to: '/admin/inbox' },
    { label: 'Unread messages', value: s.unread, icon: 'inbox', to: '/admin/inbox', accent: s.unread > 0 },
    { label: 'Services', value: s.services, icon: 'briefcase', to: '/admin/services' },
    { label: 'Projects', value: s.projects, icon: 'layers', to: '/admin/projects' },
    { label: 'Blog posts', value: s.posts, icon: 'file', to: '/admin/blog' },
    { label: 'Page views (7 days)', value: s.viewsWeek, icon: 'eye', note: delta === null ? 'No data for last week' : `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)}% vs last week`, good: (delta ?? 0) >= 0 }
  ]
})

const quick = [
  { label: 'Add service', to: '/admin/services/new', icon: 'briefcase' },
  { label: 'Add project', to: '/admin/projects/new', icon: 'layers' },
  { label: 'Write post', to: '/admin/blog/new', icon: 'pen' },
  { label: 'Open inbox', to: '/admin/inbox', icon: 'inbox' }
]
const maxViews = computed(() => Math.max(1, ...(data.value?.topPages.map(p => p.views) ?? [1])))
</script>

<template>
  <div>
    <AdminPageHeader :title="`Welcome back, ${user?.name?.split(' ')[0] ?? 'there'}`" description="Here is what is happening on your site.">
      <NuxtLink v-for="q in quick" :key="q.to" :to="q.to" class="btn btn-secondary btn-sm"><AppIcon :name="q.icon" :size="16" /> {{ q.label }}</NuxtLink>
    </AdminPageHeader>

    <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <template v-if="status === 'pending' && !data"><div v-for="n in 6" :key="n" class="skeleton h-28" /></template>
      <NuxtLink v-for="c in cards" :key="c.label" :to="c.to ?? '/admin'" class="card block p-4 transition hover:-translate-y-0.5 hover:shadow-soft sm:p-5">
        <div class="flex items-center justify-between text-muted"><span class="text-sm">{{ c.label }}</span><AppIcon :name="c.icon" :size="18" /></div>
        <p class="mt-3 font-display text-3xl font-extrabold" :class="c.accent ? 'text-accent' : 'text-ink'">{{ c.value.toLocaleString('en-US') }}</p>
        <p v-if="c.note" class="mt-1 text-xs font-medium" :class="c.good ? 'text-success' : 'text-danger'">{{ c.note }}</p>
      </NuxtLink>
    </div>

    <div v-if="data" class="mt-6 grid gap-6 lg:grid-cols-2">
      <section class="card p-5 sm:p-6" aria-labelledby="chart-messages"><h2 id="chart-messages" class="mb-4 font-bold text-ink">Messages · last 30 days</h2><AdminLineChart :series="data.messagesOverTime" label="Messages" /></section>
      <section class="card p-5 sm:p-6" aria-labelledby="chart-visits"><h2 id="chart-visits" class="mb-4 font-bold text-ink">Visits · last 30 days</h2><AdminLineChart :series="data.visitsOverTime" label="Visits" /></section>
    </div>

    <div v-if="data" class="mt-6 grid gap-6 lg:grid-cols-3">
      <section class="card p-5 sm:p-6" aria-labelledby="top-pages">
        <h2 id="top-pages" class="font-bold text-ink">Top pages</h2>
        <ul v-if="data.topPages.length" class="mt-4 space-y-3">
          <li v-for="p in data.topPages" :key="p.path">
            <div class="flex justify-between gap-3 text-sm"><span class="truncate font-medium text-ink">{{ p.path }}</span><span class="text-muted">{{ p.views }}</span></div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface"><div class="h-full rounded-full bg-accent" :style="{ width: `${(p.views / maxViews) * 100}%` }" /></div>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-muted">Page views will appear here as visitors browse the site.</p>
      </section>

      <section class="card p-5 sm:p-6" aria-labelledby="recent-messages">
        <div class="flex items-center justify-between"><h2 id="recent-messages" class="font-bold text-ink">Recent messages</h2><NuxtLink to="/admin/inbox" class="text-sm font-medium text-accent hover:underline">View all</NuxtLink></div>
        <ul v-if="data.recentMessages.length" class="mt-4 divide-y divide-line">
          <li v-for="m in data.recentMessages" :key="m.id">
            <NuxtLink :to="`/admin/inbox/${m.id}`" class="block py-3 hover:text-accent">
              <div class="flex items-center justify-between gap-2"><span class="truncate font-semibold text-ink">{{ m.name }}</span><AdminStatusBadge :status="m.status" /></div>
              <p class="mt-0.5 line-clamp-1 text-sm text-muted">{{ m.body }}</p>
              <p class="mt-0.5 text-xs text-muted">{{ timeAgo(m.createdAt) }}</p>
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-muted">No messages yet.</p>
      </section>

      <section class="card p-5 sm:p-6" aria-labelledby="recent-activity">
        <div class="flex items-center justify-between"><h2 id="recent-activity" class="font-bold text-ink">Recent activity</h2><NuxtLink to="/admin/activity" class="text-sm font-medium text-accent hover:underline">View all</NuxtLink></div>
        <ul v-if="data.recentActivity.length" class="mt-4 space-y-4">
          <li v-for="a in data.recentActivity" :key="a.id" class="flex gap-3">
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
            <div class="min-w-0"><p class="text-sm text-ink">{{ a.summary }}</p><p class="text-xs text-muted">{{ timeAgo(a.createdAt) }}</p></div>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-muted">Changes you make will be listed here.</p>
      </section>
    </div>
  </div>
</template>
