<script setup lang="ts">
const props = defineProps<{ status: string }>()
const cls = computed(() => ({
  published: 'badge-green', sent: 'badge-green', read: 'badge-gray', draft: 'badge-gray', scheduled: 'badge-amber',
  unread: 'badge-accent', archived: 'badge-gray', spam: 'badge-red', failed: 'badge-red'
} as Record<string, string>)[props.status] ?? 'badge-gray')
</script>

<template>
  <span class="badge capitalize" :class="cls">{{ status }}</span>
</template>
