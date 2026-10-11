<script setup lang="ts">
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <div class="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
    <BackgroundFx />
    <main class="relative w-full max-w-md">
      <slot />
    </main>
  </div>
</template>
