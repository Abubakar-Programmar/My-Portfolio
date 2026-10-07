<script setup lang="ts">
import { passwordRule } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Choose a new password' })

const route = useRoute()
const token = String(route.query.token ?? '')
const password = ref('')
const confirmation = ref('')
const error = ref('')
const busy = ref(false)
const done = ref(false)

async function submit() {
  error.value = ''
  const parsed = passwordRule.safeParse(password.value)
  if (!parsed.success) { error.value = parsed.error.issues[0]?.message ?? 'Invalid password'; return }
  if (password.value !== confirmation.value) { error.value = 'Passwords do not match'; return }
  busy.value = true
  try {
    await $fetch('/api/admin/reset-password', { method: 'POST', body: { token, password: password.value } })
    done.value = true
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="card p-7 shadow-lift sm:p-9">
    <h1 class="text-2xl font-bold">Choose a new password</h1>
    <p v-if="!token" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-danger" role="alert">This reset link is missing its token. Request a new one.</p>
    <div v-else-if="done" class="mt-5 space-y-4" role="status">
      <p class="rounded-xl bg-green-50 px-4 py-3 text-success">Your password was changed. You can sign in now.</p>
      <NuxtLink to="/admin/login" class="btn btn-primary w-full">Go to sign in</NuxtLink>
    </div>
    <form v-else novalidate class="mt-5 space-y-5" @submit.prevent="submit">
      <div>
        <label for="rp-pass" class="label">New password</label>
        <input id="rp-pass" v-model="password" type="password" class="input" autocomplete="new-password" required>
        <p class="hint">At least 10 characters with upper- and lowercase letters and a number.</p>
      </div>
      <div>
        <label for="rp-confirm" class="label">Confirm password</label>
        <input id="rp-confirm" v-model="confirmation" type="password" class="input" autocomplete="new-password" required>
      </div>
      <p v-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn-primary w-full" :disabled="busy">{{ busy ? 'Saving…' : 'Change password' }}</button>
    </form>
  </div>
</template>
