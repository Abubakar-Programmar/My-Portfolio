<script setup lang="ts">
import { subscribeSchema } from '#shared/schemas/contact'

const toast = useToast()
const email = ref('')
const website = ref('')
const error = ref('')
const busy = ref(false)
const done = ref(false)

async function submit() {
  error.value = ''
  const parsed = subscribeSchema.safeParse({ email: email.value, website: website.value })
  if (!parsed.success) { error.value = parsed.error.issues[0]?.message ?? 'Enter a valid email'; return }
  busy.value = true
  try {
    await $fetch('/api/subscribe', { method: 'POST', body: parsed.data })
    done.value = true
    toast.success('You are subscribed. Thanks!')
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <p v-if="done" class="rounded-xl bg-green-50 px-4 py-3 font-medium text-success" role="status">Thanks for subscribing — I’ll only email when there is something worth reading.</p>
    <form v-else novalidate class="flex flex-col gap-3 sm:flex-row" aria-label="Subscribe to new posts" @submit.prevent="submit">
      <div class="flex-1">
        <label for="nl-email" class="sr-only">Email address</label>
        <input id="nl-email" v-model="email" type="email" class="input" :class="{ 'input-error': error }" placeholder="you@example.com" autocomplete="email" :aria-invalid="Boolean(error)">
        <p v-if="error" class="field-error" role="alert">{{ error }}</p>
      </div>
      <div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true"><input v-model="website" type="text" tabindex="-1" autocomplete="off"></div>
      <button type="submit" class="btn btn-primary" :disabled="busy">{{ busy ? 'Subscribing…' : 'Subscribe' }}</button>
    </form>
  </div>
</template>
