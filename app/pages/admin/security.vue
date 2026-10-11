<script setup lang="ts">
import { changePasswordSchema, totpCodeSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Security' })
const toast = useToast()
const { fetch: refreshSession, clear } = useUserSession()

const { data: me, refresh: refreshMe } = await useFetch('/api/admin/me', { key: 'admin-me' })
const { data: sessions, refresh: refreshSessions } = useFetch('/api/admin/security/sessions', { key: 'admin-sessions' })
const { data: history } = useFetch('/api/admin/security/login-history', { key: 'admin-history' })

// Password
const pw = reactive({ currentPassword: '', newPassword: '', confirm: '' })
const pwErrors = ref<Record<string, string>>({})
const pwBusy = ref(false)
async function changePassword() {
  pwErrors.value = {}
  const parsed = changePasswordSchema.safeParse(pw)
  if (!parsed.success) { for (const i of parsed.error.issues) pwErrors.value[String(i.path[0])] ??= i.message; return }
  if (pw.newPassword !== pw.confirm) { pwErrors.value.confirm = 'Passwords do not match'; return }
  pwBusy.value = true
  try {
    await $fetch('/api/admin/security/password', { method: 'POST', body: parsed.data })
    toast.success('Password changed. Other devices were signed out.')
    Object.assign(pw, { currentPassword: '', newPassword: '', confirm: '' })
    await refreshSessions()
  } catch (err) { pwErrors.value = fieldErrors(err); toast.error(errorMessage(err)) } finally { pwBusy.value = false }
}

// Sessions
async function revoke(s: { id: string; current: boolean }) {
  const ok = await useConfirm().confirm({ title: s.current ? 'Sign out of this device?' : 'Revoke this session?', message: s.current ? 'You will need to sign in again.' : 'That device will be signed out immediately.', confirmLabel: s.current ? 'Sign out' : 'Revoke', danger: true })
  if (!ok) return
  await $fetch(`/api/admin/security/sessions/${s.id}`, { method: 'DELETE' }).catch(err => toast.error(errorMessage(err)))
  if (s.current) { await clear(); await navigateTo('/admin/login') } else { toast.success('Session revoked'); await refreshSessions() }
}

// 2FA
const setup = ref<{ secret: string; qr: string } | null>(null)
const code = ref('')
const codeError = ref('')
const disablePw = ref('')
async function startSetup() { setup.value = await $fetch('/api/admin/security/totp-setup', { method: 'POST' }).catch((e) => { toast.error(errorMessage(e)); return null }) }
async function enable() {
  codeError.value = ''
  const parsed = totpCodeSchema.safeParse({ code: code.value })
  if (!parsed.success) { codeError.value = parsed.error.issues[0]?.message ?? 'Invalid code'; return }
  try {
    await $fetch('/api/admin/security/totp-enable', { method: 'POST', body: parsed.data })
    toast.success('Two-factor authentication is on')
    setup.value = null; code.value = ''
    await Promise.all([refreshMe(), refreshSession()])
  } catch (err) { codeError.value = errorMessage(err) }
}
async function disable() {
  try {
    await $fetch('/api/admin/security/totp-disable', { method: 'POST', body: { password: disablePw.value } })
    toast.success('Two-factor authentication is off')
    disablePw.value = ''
    await refreshMe()
  } catch (err) { toast.error(errorMessage(err)) }
}
const shortUa = (ua: string | null) => (ua ?? 'Unknown device').replace(/\(.*?\)/g, '').slice(0, 70)
</script>

<template>
  <div>
    <AdminPageHeader title="Security" description="Password, two-factor authentication, active sessions and sign-in history." />
    <div class="grid gap-6 xl:grid-cols-2">
      <section class="card p-5 sm:p-6" aria-labelledby="pw-h">
        <h2 id="pw-h" class="text-lg font-bold text-ink">Change password</h2>
        <form novalidate class="mt-4 space-y-4" @submit.prevent="changePassword">
          <div><label for="cur" class="label">Current password</label><PasswordInput id="cur" v-model="pw.currentPassword" :invalid="Boolean(pwErrors.currentPassword)" autocomplete="current-password" /><p v-if="pwErrors.currentPassword" class="field-error" role="alert">{{ pwErrors.currentPassword }}</p></div>
          <div><label for="new" class="label">New password</label><PasswordInput id="new" v-model="pw.newPassword" :invalid="Boolean(pwErrors.newPassword)" autocomplete="new-password" /><p v-if="pwErrors.newPassword" class="field-error" role="alert">{{ pwErrors.newPassword }}</p><p v-else class="hint">At least 10 characters with upper- and lowercase letters and a number.</p></div>
          <div><label for="conf" class="label">Confirm new password</label><PasswordInput id="conf" v-model="pw.confirm" :invalid="Boolean(pwErrors.confirm)" autocomplete="new-password" /><p v-if="pwErrors.confirm" class="field-error" role="alert">{{ pwErrors.confirm }}</p></div>
          <button type="submit" class="btn btn-primary btn-sm" :disabled="pwBusy">{{ pwBusy ? 'Saving…' : 'Change password' }}</button>
        </form>
      </section>

      <section class="card p-5 sm:p-6" aria-labelledby="2fa-h">
        <div class="flex items-center justify-between"><h2 id="2fa-h" class="text-lg font-bold text-ink">Two-factor authentication</h2><span class="badge" :class="me?.totpEnabled ? 'badge-green' : 'badge-gray'">{{ me?.totpEnabled ? 'On' : 'Off' }}</span></div>
        <p class="mt-1 text-sm text-muted">Require a code from an authenticator app (Google Authenticator, 1Password, Authy…) when signing in.</p>
        <div v-if="!me?.totpEnabled && !setup" class="mt-4"><button type="button" class="btn btn-secondary btn-sm" @click="startSetup">Set up 2FA</button></div>
        <div v-else-if="setup" class="mt-4 space-y-4">
          <div class="flex flex-wrap items-center gap-5"><img :src="setup.qr" alt="QR code for your authenticator app" class="h-[11rem] w-[11rem] rounded-xl border border-line"><div class="min-w-0 text-sm"><p class="text-muted">Scan the QR code, or enter this key manually:</p><p class="mt-1 break-all rounded-lg bg-surface px-3 py-2 font-mono text-ink">{{ setup.secret }}</p></div></div>
          <div><label for="code" class="label">6-digit code</label><input id="code" v-model="code" inputmode="numeric" maxlength="6" class="input max-w-[10rem] text-center tracking-widest" autocomplete="one-time-code"><p v-if="codeError" class="field-error" role="alert">{{ codeError }}</p></div>
          <div class="flex gap-2"><button type="button" class="btn btn-primary btn-sm" @click="enable">Verify & enable</button><button type="button" class="btn btn-secondary btn-sm" @click="setup = null">Cancel</button></div>
        </div>
        <div v-else class="mt-4 space-y-3">
          <label for="dpw" class="label">Confirm your password to turn it off</label>
          <div class="flex gap-2"><PasswordInput id="dpw" v-model="disablePw" class="max-w-xs flex-1" autocomplete="current-password" /><button type="button" class="btn btn-danger btn-sm" :disabled="!disablePw" @click="disable">Disable</button></div>
        </div>
      </section>

      <section class="card p-5 sm:p-6" aria-labelledby="sess-h">
        <h2 id="sess-h" class="text-lg font-bold text-ink">Active sessions</h2>
        <ul class="mt-4 divide-y divide-line">
          <li v-for="s in sessions ?? []" :key="s.id" class="flex items-center justify-between gap-3 py-3">
            <div class="min-w-0"><p class="truncate font-medium text-ink">{{ shortUa(s.userAgent) }} <span v-if="s.current" class="badge badge-green ml-1">This device</span></p><p class="text-sm text-muted">{{ s.ip }} · active {{ timeAgo(s.lastSeenAt) }}</p></div>
            <button type="button" class="btn btn-secondary btn-sm shrink-0" @click="revoke(s)">{{ s.current ? 'Sign out' : 'Revoke' }}</button>
          </li>
        </ul>
      </section>

      <section class="card p-5 sm:p-6" aria-labelledby="hist-h">
        <h2 id="hist-h" class="text-lg font-bold text-ink">Login history</h2>
        <ul class="mt-4 max-h-80 divide-y divide-line overflow-y-auto">
          <li v-for="h in history ?? []" :key="h.id" class="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div class="min-w-0"><p class="truncate text-ink">{{ h.email }} · {{ h.ip }}</p><p class="text-xs text-muted">{{ formatDateTime(h.createdAt) }}<template v-if="h.reason"> · {{ h.reason.replace('_', ' ') }}</template></p></div>
            <span class="badge shrink-0" :class="h.success ? 'badge-green' : 'badge-red'">{{ h.success ? 'Success' : 'Failed' }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
