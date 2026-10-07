<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)
const title = computed(() => (notFound.value ? 'Page not found' : 'Something went wrong'))

useHead({ title: () => title.value, meta: [{ name: 'robots', content: 'noindex' }] })
const goHome = () => clearError({ redirect: '/' })
</script>

<template>
  <NuxtLayout name="default">
    <section class="section flex min-h-[70vh] items-center pt-32">
      <div class="container-x text-center">
        <p class="font-display text-8xl font-extrabold gradient-text sm:text-9xl">{{ error.statusCode }}</p>
        <h1 class="h2 mt-4">{{ title }}</h1>
        <p class="lead mx-auto mt-3 max-w-md">
          {{ notFound ? 'The page you are looking for does not exist or has moved.' : 'An unexpected error occurred. Please try again in a moment.' }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" class="btn btn-primary" @click="goHome">Back to home</button>
          <NuxtLink to="/contact" class="btn btn-secondary" @click="clearError()">Contact me</NuxtLink>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>
