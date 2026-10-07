<script setup lang="ts">
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="relative grid min-h-screen place-items-center overflow-hidden bg-paper px-4 py-10">
    <div class="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent-ring/30 blur-3xl" aria-hidden="true" />
    <div class="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
    <main class="relative w-full max-w-md">
      <slot />
    </main>
  </div>
</template>
