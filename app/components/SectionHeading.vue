<script setup lang="ts">
withDefaults(defineProps<{ eyebrow?: string; title: string; text?: string; align?: 'left' | 'center'; as?: 'h1' | 'h2' }>(), { align: 'left', as: 'h2' })
</script>

<template>
  <div v-reveal class="max-w-2xl" :class="align === 'center' ? 'mx-auto text-center' : ''">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <component :is="as" class="mt-3" :class="as === 'h1' ? 'h1' : 'h2'">{{ title }}</component>
    <p v-if="text" class="lead mt-4">{{ text }}</p>
    <slot />
  </div>
</template>
