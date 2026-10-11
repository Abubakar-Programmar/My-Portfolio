<script setup lang="ts">
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
    <BackgroundFx />
    <main class="relative w-full max-w-md">
      <NuxtLink to="/" class="btn btn-secondary btn-sm mb-4">
        <AppIcon name="arrow-left" :size="16" /> Back to website
      </NuxtLink>
      <slot />
    </main>
  </div>
</template>
