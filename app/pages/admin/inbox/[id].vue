<script setup lang="ts">
import { replySchema } from '#shared/schemas/contact'

definePageMeta({ layout: 'admin' })
interface MessageDetail {
  id: string; name: string; email: string; serviceName: string | null; budget: string | null; body: string
  status: string; starred: boolean; notes: string | null; createdAt: string
  service: { id: string; title: string; slug: string } | null
  replies: { id: string; subject: string; body: string; status: 'sent' | 'failed'; error: string | null; createdAt: string }[]
}

const route = useRoute()
const toast = useToast()
const id = String(route.params.id)
const { refresh: refreshBadges } = useAdminNotifications()

const { data: msg, error, refresh } = await useFetch<MessageDetail>(`/api/admin/messages/${id}`, { key: `admin-message-${id}` })
useHead({ title: () => (msg.value ? `Message from ${msg.value.name}` : 'Message') })
onMounted(() => refreshBadges().catch(() => {}))

const notes = ref(msg.value?.notes ?? '')
const reply = reactive({ subject: msg.value ? `Re: ${msg.value.serviceName ? `Your ${msg.value.serviceName} enquiry` : 'your message'}` : '', body: '' })
const replyError = ref('')
const sending = ref(false)

async function patch(body: Record<string, unknown>, success?: string) {
  try {
    await $fetch(`/api/admin/messages/${id}`, { method: 'PATCH', body })
    if (success) toast.success(success)
    await refresh()
    await refreshBadges()
  } catch (err) { toast.error(errorMessage(err)) }
}

async function remove() {
  const ok = await useConfirm().confirm({ title: 'Delete this message?', message: 'This cannot be undone.', confirmLabel: 'Delete', danger: true })
  if (!ok) return
  await $fetch(`/api/admin/messages/${id}`, { method: 'DELETE' }).catch(err => toast.error(errorMessage(err)))
  await navigateTo('/admin/inbox')
}

async function send() {
  replyError.value = ''
  const parsed = replySchema.safeParse(reply)
  if (!parsed.success) { replyError.value = parsed.error.issues[0]?.message ?? 'Check your reply'; return }
  sending.value = true
  try {
    await $fetch(`/api/admin/messages/${id}/reply`, { method: 'POST', body: parsed.data })
    toast.success('Reply sent')
    reply.body = ''
    await refresh()
  } catch (err) {
    replyError.value = errorMessage(err)
    await refresh()
  } finally { sending.value = false }
}
</script>

<template>
  <div>
    <NuxtLink to="/admin/inbox" class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent"><AppIcon name="arrow-left" :size="16" /> Inbox</NuxtLink>
    <p v-if="error" class="card p-6 text-danger" role="alert">This message could not be found.</p>

    <div v-else-if="msg" class="grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <section class="card p-5 sm:p-7">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <h1 class="font-display text-2xl font-bold text-ink">{{ msg.name }}</h1>
              <a :href="`mailto:${msg.email}`" class="break-all text-accent hover:underline">{{ msg.email }}</a>
            </div>
            <div class="flex items-center gap-2">
              <AdminStatusBadge :status="msg.status" />
              <button type="button" class="btn btn-ghost btn-icon" :class="msg.starred ? 'text-amber-500' : ''" :aria-label="msg.starred ? 'Unstar' : 'Star'" @click="patch({ starred: !msg.starred })"><AppIcon :name="msg.starred ? 'star-filled' : 'star'" /></button>
            </div>
          </div>
          <dl class="mt-5 grid gap-4 border-y border-line py-5 text-sm sm:grid-cols-3">
            <div><dt class="text-muted">Service</dt><dd class="font-semibold text-ink"><NuxtLink v-if="msg.service" :to="`/admin/services/${msg.service.id}`" class="text-accent hover:underline">{{ msg.service.title }}</NuxtLink><template v-else>{{ msg.serviceName || 'Not specified' }}</template></dd></div>
            <div><dt class="text-muted">Budget</dt><dd class="font-semibold text-ink">{{ msg.budget || 'Not specified' }}</dd></div>
            <div><dt class="text-muted">Received</dt><dd class="font-semibold text-ink">{{ formatDateTime(msg.createdAt) }}</dd></div>
          </dl>
          <p class="mt-5 whitespace-pre-wrap text-[1.02rem] leading-relaxed text-ink">{{ msg.body }}</p>
          <div class="mt-6 flex flex-wrap gap-2">
            <button type="button" class="btn btn-secondary btn-sm" @click="patch({ status: 'unread' }, 'Marked as unread')"><AppIcon name="eye" :size="16" /> Mark unread</button>
            <button v-if="msg.status !== 'archived'" type="button" class="btn btn-secondary btn-sm" @click="patch({ status: 'archived' }, 'Archived')"><AppIcon name="archive" :size="16" /> Archive</button>
            <button v-else type="button" class="btn btn-secondary btn-sm" @click="patch({ status: 'read' }, 'Moved to inbox')">Move to inbox</button>
            <button v-if="msg.status !== 'spam'" type="button" class="btn btn-secondary btn-sm" @click="patch({ status: 'spam' }, 'Marked as spam')"><AppIcon name="ban" :size="16" /> Spam</button>
            <button type="button" class="btn btn-ghost btn-sm text-danger" @click="remove"><AppIcon name="trash" :size="16" /> Delete</button>
          </div>
        </section>

        <section v-if="msg.replies.length" class="space-y-3" aria-label="Sent replies">
          <h2 class="font-bold text-ink">Replies</h2>
          <article v-for="r in msg.replies" :key="r.id" class="card border-l-4 p-5" :class="r.status === 'sent' ? 'border-l-accent' : 'border-l-danger'">
            <div class="flex flex-wrap items-center justify-between gap-2 text-sm"><span class="font-semibold text-ink">{{ r.subject }}</span><span class="text-muted">{{ formatDateTime(r.createdAt) }} · <AdminStatusBadge :status="r.status" /></span></div>
            <p class="mt-3 whitespace-pre-wrap text-body">{{ r.body }}</p>
            <p v-if="r.error" class="mt-2 text-sm text-danger">{{ r.error }}</p>
          </article>
        </section>

        <section class="card p-5 sm:p-7" aria-labelledby="reply-h">
          <h2 id="reply-h" class="font-bold text-ink">Reply by email</h2>
          <p class="text-sm text-muted">Sent to {{ msg.email }} through your SMTP account. A copy is stored here.</p>
          <form novalidate class="mt-4 space-y-4" @submit.prevent="send">
            <div><label for="r-subject" class="label">Subject</label><input id="r-subject" v-model="reply.subject" class="input" type="text"></div>
            <div><label for="r-body" class="label">Message</label><textarea id="r-body" v-model="reply.body" class="input" rows="7" /></div>
            <p v-if="replyError" class="field-error" role="alert">{{ replyError }}</p>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="sending"><AppIcon name="send" :size="16" /> {{ sending ? 'Sending…' : 'Send reply' }}</button>
          </form>
        </section>
      </div>

      <aside class="lg:col-span-1">
        <section class="card p-5 sm:p-6" aria-labelledby="notes-h">
          <h2 id="notes-h" class="font-bold text-ink">Internal notes</h2>
          <p class="text-sm text-muted">Only visible to you.</p>
          <label for="notes" class="sr-only">Internal notes</label>
          <textarea id="notes" v-model="notes" class="input mt-3" rows="6" placeholder="Follow-ups, call notes, quote details…" />
          <button type="button" class="btn btn-secondary btn-sm mt-3" @click="patch({ notes }, 'Notes saved')">Save notes</button>
        </section>
      </aside>
    </div>
  </div>
</template>
