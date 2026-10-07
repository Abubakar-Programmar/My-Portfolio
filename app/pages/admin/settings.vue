<script setup lang="ts">
import type { SettingGroup } from '#shared/schemas/settings'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Site settings' })

const toast = useToast()
const tabs: { key: SettingGroup | 'email'; label: string }[] = [
  { key: 'general', label: 'General' }, { key: 'seo', label: 'SEO' }, { key: 'contact', label: 'Contact' },
  { key: 'socials', label: 'Social links' }, { key: 'notifications', label: 'Notifications' }, { key: 'email', label: 'Email delivery' }
]
const route = useRoute()
const tab = ref<SettingGroup | 'email'>((tabs.find(t => t.key === route.query.tab)?.key) ?? 'general')

const { data: log, refresh: refreshLog } = useFetch('/api/admin/email/logs', { key: 'admin-email-log', immediate: false })
watch(tab, (t) => { if (t === 'email') refreshLog() }, { immediate: true })
const testing = ref(false)

async function sendTest() {
  testing.value = true
  try {
    const res = await $fetch<{ to: string }>('/api/admin/email/test', { method: 'POST' })
    toast.success(`Test email sent to ${res.to}`)
  } catch (err) { toast.error(errorMessage(err)) } finally { testing.value = false; await refreshLog() }
}
</script>

<template>
  <div>
    <AdminPageHeader title="Site settings" description="Everything the public site reads from the database — no code changes needed." />

    <div class="mb-6 flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Settings sections">
      <button v-for="t in tabs" :key="t.key" type="button" role="tab" :aria-selected="tab === t.key" class="-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition" :class="tab === t.key ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'" @click="tab = t.key">{{ t.label }}</button>
    </div>

    <AdminSettingsForm v-if="tab !== 'email'" :key="tab" :group="tab" />

    <div v-else class="space-y-6">
      <section class="card p-5 sm:p-6">
        <h2 class="text-lg font-bold text-ink">SMTP connection</h2>
        <p class="mt-1 text-sm text-muted">
          <span :class="log?.smtpConfigured ? 'text-success' : 'text-danger'">{{ log?.smtpConfigured ? 'SMTP credentials are configured.' : 'SMTP is not configured — set the MAIL_* variables in .env.' }}</span>
          Send a test message to your notification address to confirm delivery.
        </p>
        <button type="button" class="btn btn-primary btn-sm mt-4" :disabled="testing" @click="sendTest"><AppIcon name="send" :size="16" /> {{ testing ? 'Sending…' : 'Send test email' }}</button>
      </section>
      <section class="card overflow-hidden">
        <div class="flex items-center justify-between border-b border-line p-5"><h2 class="text-lg font-bold text-ink">Delivery log</h2><span v-if="log?.failed" class="badge badge-red">{{ log.failed }} failed</span></div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[38rem] text-left text-sm">
            <thead class="bg-surface text-xs font-semibold uppercase tracking-wider text-muted"><tr><th class="px-4 py-3">When</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">To</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Details</th></tr></thead>
            <tbody class="divide-y divide-line">
              <tr v-for="e in log?.items ?? []" :key="e.id">
                <td class="whitespace-nowrap px-4 py-3 text-muted">{{ formatDateTime(e.createdAt) }}</td><td class="px-4 py-3">{{ e.kind }}</td><td class="px-4 py-3">{{ e.toAddress }}</td>
                <td class="px-4 py-3"><AdminStatusBadge :status="e.status" /></td><td class="max-w-xs truncate px-4 py-3 text-muted" :title="e.error ?? ''">{{ e.error || `${e.attempts} attempt${e.attempts === 1 ? '' : 's'}` }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="log && !log.items.length" class="p-8 text-center text-sm text-muted">No emails sent yet.</p>
      </section>
    </div>
  </div>
</template>
