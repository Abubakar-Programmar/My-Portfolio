<script setup lang="ts">
import { loginSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign in' })

const { fetch: refreshSession } = useUserSession()
const form = reactive({ email: '', password: '', totp: '' })
const errors = ref<Record<string, string>>({})
const message = ref('')
const busy = ref(false)
const needsTotp = ref(false)

async function submit() {
  errors.value = {}
  message.value = ''
  const parsed = loginSchema.safeParse({ email: form.email, password: form.password, totp: form.totp || undefined })
  if (!parsed.success) {
    for (const i of parsed.error.issues) errors.value[String(i.path[0])] ??= i.message
    return
  }
  busy.value = true
  try {
    const res = await $fetch<{ ok?: boolean; requiresTotp?: boolean }>('/api/admin/login', { method: 'POST', body: parsed.data })
    if (res.requiresTotp) { needsTotp.value = true; return }
    await refreshSession()
    await navigateTo('/admin')
  } catch (err) {
    message.value = errorMessage(err, 'Could not sign in.')
    errors.value = fieldErrors(err)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="card p-7 shadow-lift sm:p-9">
    <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-white"><AppIcon name="lock" :size="24" /></div>
    <h1 class="mt-5 text-center text-2xl font-bold">Admin sign in</h1>
    <p class="mt-1 text-center text-sm text-muted">Enter your credentials to manage the site.</p>

    <form novalidate class="mt-7 space-y-5" @submit.prevent="submit">
      <div v-if="!needsTotp" class="space-y-5">
        <div>
          <label for="email" class="label">Email</label>
          <input id="email" v-model="form.email" type="email" class="input" :class="{ 'input-error': errors.email }" autocomplete="username" required>
          <p v-if="errors.email" class="field-error" role="alert">{{ errors.email }}</p>
        </div>
        <div>
          <div class="flex items-center justify-between"><label for="password" class="label">Password</label><NuxtLink to="/admin/forgot-password" class="mb-1.5 text-sm font-medium text-accent hover:underline">Forgot?</NuxtLink></div>
          <PasswordInput id="password" v-model="form.password" :invalid="Boolean(errors.password)" autocomplete="current-password" required />
          <p v-if="errors.password" class="field-error" role="alert">{{ errors.password }}</p>
        </div>
      </div>
      <div v-else>
        <label for="totp" class="label">Authentication code</label>
        <input id="totp" v-model="form.totp" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" class="input text-center text-xl tracking-[0.5em]" autofocus>
        <p class="hint">Open your authenticator app and enter the 6-digit code.</p>
      </div>

      <p v-if="message" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger" role="alert">{{ message }}</p>
      <button type="submit" class="btn btn-primary w-full" :disabled="busy">{{ busy ? 'Signing in…' : needsTotp ? 'Verify' : 'Sign in' }}</button>
    </form>
  </div>
</template>
