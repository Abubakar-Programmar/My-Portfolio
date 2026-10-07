<script setup lang="ts">
defineEmits<{ navigate: [] }>()
const route = useRoute()
const { inboxUnread } = useAdminNotifications()
const site = useSite()

interface NavItem { label: string; to: string; icon: string; badge?: number }
const groups = computed<{ title: string; items: NavItem[] }[]>(() => [
  { title: 'Overview', items: [
    { label: 'Dashboard', to: '/admin', icon: 'dashboard' },
    { label: 'Inbox', to: '/admin/inbox', icon: 'inbox', badge: inboxUnread.value }
  ] },
  { title: 'Content', items: [
    { label: 'Services', to: '/admin/services', icon: 'briefcase' },
    { label: 'Projects', to: '/admin/projects', icon: 'layers' },
    { label: 'Blog', to: '/admin/blog', icon: 'file' },
    { label: 'Testimonials', to: '/admin/testimonials', icon: 'quote' },
    { label: 'Media library', to: '/admin/media', icon: 'image' }
  ] },
  { title: 'About & profile', items: [
    { label: 'Profile', to: '/admin/profile', icon: 'user' },
    { label: 'Skills', to: '/admin/skills', icon: 'sparkles' },
    { label: 'Experience', to: '/admin/experience', icon: 'briefcase' },
    { label: 'Education', to: '/admin/education', icon: 'book' },
    { label: 'Certifications', to: '/admin/certifications', icon: 'award' }
  ] },
  { title: 'Taxonomies', items: [
    { label: 'Service categories', to: '/admin/service-categories', icon: 'folder' },
    { label: 'Blog categories', to: '/admin/blog-categories', icon: 'folder' },
    { label: 'Tags', to: '/admin/tags', icon: 'hash' }
  ] },
  { title: 'System', items: [
    { label: 'Site settings', to: '/admin/settings', icon: 'settings' },
    { label: 'Security', to: '/admin/security', icon: 'lock' },
    { label: 'Activity log', to: '/admin/activity', icon: 'activity' },
    { label: 'Data export', to: '/admin/export', icon: 'database' }
  ] }
])

const isActive = (to: string) => (to === '/admin' ? route.path === '/admin' : route.path === to || route.path.startsWith(`${to}/`))
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-5">
      <span class="grid h-9 w-9 place-items-center rounded-xl bg-accent text-sm font-extrabold text-white">{{ initials(site.general.siteTitle) }}</span>
      <div class="min-w-0 leading-tight">
        <p class="truncate font-display text-base font-bold text-ink">{{ site.general.siteTitle }}</p>
        <p class="text-xs text-muted">Admin panel</p>
      </div>
    </div>
    <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin">
      <div v-for="g in groups" :key="g.title">
        <p class="px-3 text-xs font-semibold uppercase tracking-wider text-muted">{{ g.title }}</p>
        <ul class="mt-2 space-y-0.5">
          <li v-for="item in g.items" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="group flex items-center gap-3 rounded-xl px-3 py-2 text-[0.92rem] font-medium transition-colors"
              :class="isActive(item.to) ? 'bg-accent-soft text-accent-dark' : 'text-body hover:bg-surface hover:text-ink'"
              :aria-current="isActive(item.to) ? 'page' : undefined"
              @click="$emit('navigate')"
            >
              <AppIcon :name="item.icon" :size="19" />
              <span class="flex-1">{{ item.label }}</span>
              <span v-if="item.badge" class="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">{{ item.badge }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>
    <div class="shrink-0 border-t border-line p-3">
      <a href="/" target="_blank" rel="noopener" class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-body transition hover:bg-surface hover:text-ink">
        <AppIcon name="external-link" :size="18" /> View website
      </a>
    </div>
  </div>
</template>
