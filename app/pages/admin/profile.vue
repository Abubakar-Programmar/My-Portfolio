<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Profile' })

const lists = [
  { label: 'Skills', to: '/admin/skills', icon: 'sparkles', text: 'Skill levels grouped by category' },
  { label: 'Experience', to: '/admin/experience', icon: 'briefcase', text: 'Work history timeline' },
  { label: 'Education', to: '/admin/education', icon: 'book', text: 'Degrees and courses' },
  { label: 'Certifications', to: '/admin/certifications', icon: 'award', text: 'Credentials and badges' }
]
</script>

<template>
  <div>
    <AdminPageHeader title="Profile & About" description="Your bio, photo, resume, availability and the stats shown across the site." />
    <ul class="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <li v-for="l in lists" :key="l.to">
        <NuxtLink :to="l.to" class="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
          <span class="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent-dark"><AppIcon :name="l.icon" /></span>
          <span><span class="block font-semibold text-ink">{{ l.label }}</span><span class="text-sm text-muted">{{ l.text }}</span></span>
        </NuxtLink>
      </li>
    </ul>
    <AdminSettingsForm group="profile" />
  </div>
</template>
