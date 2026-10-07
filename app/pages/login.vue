<script setup lang="ts">
// Short, memorable alias for the admin sign-in page.
definePageMeta({ middleware: () => navigateTo('/admin/login', { replace: true, redirectCode: 302 }) })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <div />
</template>
