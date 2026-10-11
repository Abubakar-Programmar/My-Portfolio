<script setup lang="ts">
import { BUDGET_RANGES, contactSchema } from '#shared/schemas/contact'

const route = useRoute()
const toast = useToast()
const site = useSite()
const { data: services } = useFetch('/api/services', { key: 'contact-services', transform: d => d.items.map(s => ({ id: s.id, slug: s.slug, title: s.title })) })

const OTHER = 'other'
const form = reactive({ name: '', email: '', serviceId: '', customService: '', budget: '', message: '', website: '' })
const startedAt = ref(0)
const errors = ref<Record<string, string>>({})
const sending = ref(false)
const sent = ref(false)
const sentTo = ref('')

// The confirmation banner fades away on its own after a few seconds.
const CONFIRMATION_MS = 3000
const { start: hideConfirmation, stop: cancelHideConfirmation } = useTimeoutFn(() => (sent.value = false), CONFIRMATION_MS, { immediate: false })

onMounted(() => (startedAt.value = Date.now()))

// "Request a quote" links arrive as /contact?service=<slug>; pre-select that service.
watchEffect(() => {
  const wanted = String(route.query.service ?? '')
  if (wanted && !form.serviceId && services.value) {
    form.serviceId = services.value.find(s => s.slug === wanted || s.id === wanted)?.id ?? ''
  }
})

async function submit() {
  errors.value = {}
  const isOther = form.serviceId === OTHER
  const payload = {
    ...form,
    serviceId: form.serviceId && !isOther ? form.serviceId : null,
    customService: isOther ? form.customService : null,
    budget: form.budget || null,
    startedAt: startedAt.value
  }
  const parsed = contactSchema.safeParse(payload)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors.value[String(issue.path[0])] ??= issue.message
  }
  if (isOther && !form.customService.trim()) errors.value.customService = 'Please describe the service you need'
  if (Object.keys(errors.value).length) return
  sending.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: payload })
    // Keep the form on screen: clear it for the next message and confirm above it.
    sentTo.value = form.email
    reset()
    sent.value = true
    cancelHideConfirmation()
    hideConfirmation()
    toast.show({ message: 'Message sent — thank you!', duration: CONFIRMATION_MS })
  } catch (err) {
    errors.value = fieldErrors(err)
    toast.error(errorMessage(err))
  } finally {
    sending.value = false
  }
}

function reset() {
  Object.assign(form, { name: '', email: '', serviceId: '', customService: '', budget: '', message: '', website: '' })
  startedAt.value = Date.now()
}
</script>

<template>
  <div class="card relative overflow-hidden p-6 shadow-soft sm:p-8">
    <div>
      <Transition name="fade">
        <div v-if="sent" class="mb-6 flex items-start gap-3 rounded-xl bg-green-50 p-4" role="status">
          <AppIcon name="check-circle" :size="24" class="mt-0.5 shrink-0 text-success" />
          <div>
            <p class="font-semibold text-ink">Message sent — thank you!</p>
            <p class="text-sm text-muted">We have received your request and will respond to <strong class="break-all text-ink">{{ sentTo }}</strong> within the next five working hours.</p>
          </div>
        </div>
      </Transition>

      <form novalidate class="space-y-5" aria-label="Contact form" @submit.prevent="submit">
        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="cf-name" class="label">Your name</label>
            <input id="cf-name" v-model="form.name" class="input" :class="{ 'input-error': errors.name }" type="text" autocomplete="name" required :aria-invalid="Boolean(errors.name)" :aria-describedby="errors.name ? 'cf-name-err' : undefined">
            <p v-if="errors.name" id="cf-name-err" class="field-error" role="alert">{{ errors.name }}</p>
          </div>
          <div>
            <label for="cf-email" class="label">Email</label>
            <input id="cf-email" v-model="form.email" class="input" :class="{ 'input-error': errors.email }" type="email" autocomplete="email" required :aria-invalid="Boolean(errors.email)" :aria-describedby="errors.email ? 'cf-email-err' : undefined">
            <p v-if="errors.email" id="cf-email-err" class="field-error" role="alert">{{ errors.email }}</p>
          </div>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="cf-service" class="label">Service interested in</label>
            <select id="cf-service" v-model="form.serviceId" class="input">
              <option value="">Not sure yet</option>
              <option v-for="s in services ?? []" :key="s.id" :value="s.id">{{ s.title }}</option>
              <option :value="OTHER">Other (describe below)</option>
            </select>
            <div v-if="form.serviceId === OTHER" class="mt-3">
              <label for="cf-custom" class="label">Which service do you need?</label>
              <input id="cf-custom" v-model="form.customService" class="input" :class="{ 'input-error': errors.customService }" type="text" maxlength="120" placeholder="e.g. Mobile app, API integration…" :aria-invalid="Boolean(errors.customService)">
              <p v-if="errors.customService" class="field-error" role="alert">{{ errors.customService }}</p>
            </div>
          </div>
          <div>
            <label for="cf-budget" class="label">Budget range</label>
            <select id="cf-budget" v-model="form.budget" class="input">
              <option value="">Select a range</option>
              <option v-for="b in BUDGET_RANGES" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>
        </div>

        <div>
          <label for="cf-message" class="label">How can I help?</label>
          <textarea id="cf-message" v-model="form.message" class="input" :class="{ 'input-error': errors.message }" rows="6" required :aria-invalid="Boolean(errors.message)" :aria-describedby="errors.message ? 'cf-message-err' : undefined" />
          <p v-if="errors.message" id="cf-message-err" class="field-error" role="alert">{{ errors.message }}</p>
        </div>

        <!-- Honeypot: invisible to people, tempting to bots -->
        <div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label>Leave this field empty<input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off"></label>
        </div>

        <div class="flex flex-col-reverse items-stretch justify-between gap-4 sm:flex-row sm:items-center">
          <p class="text-sm text-muted">
            By sending this you agree to the <NuxtLink to="/privacy" class="text-accent underline-offset-2 hover:underline">Privacy Policy</NuxtLink>.
          </p>
          <button type="submit" class="btn btn-primary" :disabled="sending">
            <span v-if="sending" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            {{ sending ? 'Sending…' : 'Send message' }}
            <AppIcon v-if="!sending" name="send" :size="16" />
          </button>
        </div>
        <p v-if="site.contact.bookingUrl" class="border-t border-line pt-5 text-sm text-muted">
          Prefer a call? <a :href="site.contact.bookingUrl" target="_blank" rel="noopener noreferrer" class="font-semibold text-accent hover:underline">Book a free 20-minute intro call</a>.
        </p>
      </form>
    </div>
  </div>
</template>
