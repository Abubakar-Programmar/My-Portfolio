<script setup lang="ts">
const site = useSite()
useHead({ title: 'Back soon', meta: [{ name: 'robots', content: 'noindex' }] })
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-paper px-6 text-center">
    <div class="max-w-md">
      <div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-accent"><AppIcon name="settings" :size="30" /></div>
      <h1 class="h2 mt-6">We’ll be right back</h1>
      <p class="lead mt-3">{{ site.general.maintenanceMessage }}</p>
      <NuxtLink to="/admin/login" class="mt-8 inline-block text-sm text-muted underline-offset-4 hover:underline">Admin</NuxtLink>
    </div>
  </main>
</template>
