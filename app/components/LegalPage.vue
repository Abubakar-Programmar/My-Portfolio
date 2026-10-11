<script setup lang="ts">
defineProps<{ title: string; updated: string }>()
</script>

<template>
  <section class="pt-32 sm:pt-36">
    <div class="container-x max-w-3xl pb-20">
      <BreadcrumbNav :items="[{ name: title }]" />
      <h1 class="h1 mt-5 !text-4xl sm:!text-5xl">{{ title }}</h1>
      <p class="mt-3 text-muted">Last updated {{ updated }}</p>
      <div class="prose-content mt-10 [overflow-wrap:anywhere]"><slot /></div>
    </div>
  </section>
</template>
