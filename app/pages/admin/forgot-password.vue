<script setup lang="ts">
import { forgotPasswordSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Forgot password' })

const email = ref('')
const error = ref('')
const busy = ref(false)
const sent = ref(false)

async function submit() {
  error.value = ''
  const parsed = forgotPasswordSchema.safeParse({ email: email.value })
  if (!parsed.success) { error.value = parsed.error.issues[0]?.message ?? 'Enter a valid email'; return }
  busy.value = true
  try {
    await $fetch('/api/admin/forgot-password', { method: 'POST', body: parsed.data })
    sent.value = true
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="card p-7 shadow-lift sm:p-9">
    <h1 class="text-2xl font-bold">Reset your password</h1>
    <div v-if="sent" class="mt-5 space-y-4" role="status">
      <p class="rounded-xl bg-green-50 px-4 py-3 text-success">If an account exists for that address, a reset link is on its way. It is valid for 30 minutes.</p>
      <NuxtLink to="/admin/login" class="btn btn-secondary w-full">Back to sign in</NuxtLink>
    </div>
    <form v-else novalidate class="mt-5 space-y-5" @submit.prevent="submit">
      <p class="text-sm text-muted">Enter your admin email and we will send you a link to choose a new password.</p>
      <div>
        <label for="fp-email" class="label">Email</label>
        <input id="fp-email" v-model="email" type="email" class="input" :class="{ 'input-error': error }" autocomplete="email" required>
        <p v-if="error" class="field-error" role="alert">{{ error }}</p>
      </div>
      <button type="submit" class="btn btn-primary w-full" :disabled="busy">{{ busy ? 'Sending…' : 'Send reset link' }}</button>
      <NuxtLink to="/admin/login" class="block text-center text-sm font-medium text-accent hover:underline">Back to sign in</NuxtLink>
    </form>
  </div>
</template>
