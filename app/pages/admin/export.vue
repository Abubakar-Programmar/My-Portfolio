<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Data export' })

const sets = [
  { kind: 'messages', label: 'Messages', icon: 'inbox', text: 'Every contact message with status and notes.' },
  { kind: 'subscribers', label: 'Subscribers', icon: 'mail', text: 'Blog subscriber email addresses.' },
  { kind: 'services', label: 'Services', icon: 'briefcase', text: 'All services including drafts.' },
  { kind: 'projects', label: 'Projects', icon: 'layers', text: 'All case studies.' },
  { kind: 'posts', label: 'Blog posts', icon: 'file', text: 'All posts with content and SEO fields.' },
  { kind: 'testimonials', label: 'Testimonials', icon: 'quote', text: 'Client quotes.' },
  { kind: 'page-views', label: 'Page views', icon: 'eye', text: 'Raw first-party analytics rows.' }
]
</script>

<template>
  <div>
    <AdminPageHeader title="Data export" description="Download your data as JSON or CSV. Exports are recorded in the activity log." />
    <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="s in sets" :key="s.kind" class="card flex flex-col p-5">
        <div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-dark"><AppIcon :name="s.icon" /></span><h2 class="font-bold text-ink">{{ s.label }}</h2></div>
        <p class="mt-3 flex-1 text-sm text-muted">{{ s.text }}</p>
        <div class="mt-4 flex gap-2">
          <a :href="`/api/admin/export/${s.kind}?format=json`" class="btn btn-secondary btn-sm" download>JSON</a>
          <a :href="`/api/admin/export/${s.kind}?format=csv`" class="btn btn-secondary btn-sm" download>CSV</a>
        </div>
      </li>
    </ul>
  </div>
</template>
