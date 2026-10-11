<script setup lang="ts">
import { forgotPasswordSchema, passwordRule, verifyOtpSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Forgot password' })

type Step = 'email' | 'otp' | 'password' | 'done'

const RESEND_SECONDS = 60
const step = ref<Step>('email')
const email = ref('')
const otp = ref('')
const password = ref('')
const confirmation = ref('')
const resetToken = ref('')
const error = ref('')
const busy = ref(false)
const cooldown = ref(0)

const { pause, resume } = useIntervalFn(() => {
  cooldown.value = Math.max(0, cooldown.value - 1)
  if (cooldown.value === 0) pause()
}, 1000, { immediate: false })

function startCooldown() {
  cooldown.value = RESEND_SECONDS
  resume()
}

async function sendCode() {
  error.value = ''
  const parsed = forgotPasswordSchema.safeParse({ email: email.value })
  if (!parsed.success) { error.value = parsed.error.issues[0]?.message ?? 'Enter a valid email'; return }
  busy.value = true
  try {
    await $fetch('/api/admin/forgot-password', { method: 'POST', body: parsed.data })
    otp.value = ''
    step.value = 'otp'
    startCooldown()
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    busy.value = false
  }
}

async function resend() {
  if (cooldown.value > 0 || busy.value) return
  await sendCode()
}

async function verifyCode() {
  error.value = ''
  const parsed = verifyOtpSchema.safeParse({ email: email.value, otp: otp.value })
  if (!parsed.success) { error.value = parsed.error.issues[0]?.message ?? 'Enter the 6-digit code'; return }
  busy.value = true
  try {
    const res = await $fetch<{ resetToken: string }>('/api/admin/verify-otp', { method: 'POST', body: parsed.data })
    resetToken.value = res.resetToken
    step.value = 'password'
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    busy.value = false
  }
}

async function setPassword() {
  error.value = ''
  const parsed = passwordRule.safeParse(password.value)
  if (!parsed.success) { error.value = parsed.error.issues[0]?.message ?? 'Invalid password'; return }
  if (password.value !== confirmation.value) { error.value = 'Passwords do not match'; return }
  busy.value = true
  try {
    await $fetch('/api/admin/reset-password', { method: 'POST', body: { token: resetToken.value, password: password.value } })
    step.value = 'done'
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    busy.value = false
  }
}

function onOtpInput() {
  otp.value = otp.value.replace(/\D/g, '').slice(0, 6)
  if (otp.value.length === 6 && !busy.value) void verifyCode()
}

function changeEmail() {
  step.value = 'email'
  error.value = ''
  otp.value = ''
}
</script>

<template>
  <div class="card p-7 shadow-lift sm:p-9">
    <div class="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-cream"><AppIcon :name="step === 'done' ? 'check-circle' : step === 'password' ? 'lock' : 'mail'" :size="24" /></div>

    <!-- Step 1: email -->
    <form v-if="step === 'email'" novalidate class="mt-5 space-y-5" @submit.prevent="sendCode">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Forgot your password?</h1>
        <p class="mt-1 text-sm text-muted">Enter your admin email and we will send you a 6-digit code.</p>
      </div>
      <div>
        <label for="fp-email" class="label">Email</label>
        <input id="fp-email" v-model="email" type="email" class="input" :class="{ 'input-error': error }" autocomplete="email" required autofocus>
        <p v-if="error" class="field-error" role="alert">{{ error }}</p>
      </div>
      <button type="submit" class="btn btn-primary w-full" :disabled="busy">{{ busy ? 'Sending…' : 'Send code' }}</button>
      <NuxtLink to="/admin/login" class="block text-center text-sm font-medium text-accent hover:underline">Back to sign in</NuxtLink>
    </form>

    <!-- Step 2: 6-digit code -->
    <form v-else-if="step === 'otp'" novalidate class="mt-5 space-y-5" @submit.prevent="verifyCode">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Enter the code</h1>
        <p class="mt-1 text-sm text-muted">If <strong class="break-all text-ink">{{ email }}</strong> belongs to an account, a 6-digit code is on its way. It is valid for 10 minutes.</p>
      </div>
      <div>
        <label for="fp-otp" class="label">6-digit code</label>
        <input
          id="fp-otp"
          v-model="otp"
          type="text"
          inputmode="numeric"
          maxlength="6"
          autocomplete="one-time-code"
          placeholder="••••••"
          class="input text-center font-mono text-2xl tracking-[0.5em]"
          :class="{ 'input-error': error }"
          required
          autofocus
          @input="onOtpInput"
        >
        <p v-if="error" class="field-error" role="alert">{{ error }}</p>
      </div>
      <button type="submit" class="btn btn-primary w-full" :disabled="busy || otp.length !== 6">{{ busy ? 'Checking…' : 'Verify code' }}</button>
      <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
        <button type="button" class="font-medium text-accent hover:underline disabled:text-muted disabled:no-underline" :disabled="cooldown > 0 || busy" @click="resend">
          {{ cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code' }}
        </button>
        <button type="button" class="font-medium text-muted hover:text-accent hover:underline" @click="changeEmail">Use a different email</button>
      </div>
    </form>

    <!-- Step 3: new password -->
    <form v-else-if="step === 'password'" novalidate class="mt-5 space-y-5" @submit.prevent="setPassword">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Set a new password</h1>
        <p class="mt-1 text-sm text-muted">Code verified. Choose a password you have not used before.</p>
      </div>
      <div>
        <label for="fp-pass" class="label">New password</label>
        <PasswordInput id="fp-pass" v-model="password" autocomplete="new-password" required autofocus />
        <p class="hint">At least 10 characters with upper- and lowercase letters and a number.</p>
      </div>
      <div>
        <label for="fp-confirm" class="label">Confirm new password</label>
        <PasswordInput id="fp-confirm" v-model="confirmation" autocomplete="new-password" required />
      </div>
      <p v-if="error" class="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn-primary w-full" :disabled="busy">{{ busy ? 'Saving…' : 'Change password' }}</button>
    </form>

    <!-- Done -->
    <div v-else class="mt-5 space-y-5 text-center" role="status">
      <h1 class="text-2xl font-bold">Password changed</h1>
      <p class="rounded-xl bg-green-50 px-4 py-3 text-success">Your password was updated and all other sessions were signed out. You can sign in now.</p>
      <NuxtLink to="/admin/login" class="btn btn-primary w-full">Go to sign in</NuxtLink>
    </div>
  </div>
</template>
