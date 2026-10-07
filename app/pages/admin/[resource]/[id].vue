<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const toast = useToast()
const cfg = findResource(String(route.params.resource))
if (!cfg) throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
const config = cfg

const id = String(route.params.id)
const isNew = id === 'new'
useHead({ title: isNew ? `New ${config.singular.toLowerCase()}` : `Edit ${config.singular.toLowerCase()}` })

const data = ref<Record<string, unknown>>(config.defaults())
const errors = ref<Record<string, string>>({})
const loading = ref(!isNew)
const saving = ref(false)
const loadError = ref('')

onMounted(async () => {
  if (isNew) return
  try {
    data.value = { ...config.defaults(), ...(await $fetch<Record<string, unknown>>(`/api/admin/${config.apiKey}/${id}`)) }
  } catch (err) {
    loadError.value = errorMessage(err, 'Could not load this record.')
  } finally {
    loading.value = false
  }
})

async function save() {
  errors.value = {}
  const parsed = config.schema.safeParse(data.value)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors.value[issue.path.join('.')] ??= issue.message
    toast.error(`Please fix: ${parsed.error.issues[0]?.message}`)
    await nextTick()
    document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  saving.value = true
  try {
    const saved = await $fetch<Record<string, unknown>>(isNew ? `/api/admin/${config.apiKey}` : `/api/admin/${config.apiKey}/${id}`, { method: isNew ? 'POST' : 'PUT', body: data.value })
    toast.success(`${config.singular} saved`)
    if (isNew) await navigateTo(`/admin/${config.path}/${saved.id}`, { replace: true })
    else data.value = { ...config.defaults(), ...saved }
  } catch (err) {
    errors.value = fieldErrors(err)
    toast.error(errorMessage(err))
  } finally {
    saving.value = false
  }
}

async function remove() {
  const ok = await useConfirm().confirm({ title: `Delete this ${config.singular.toLowerCase()}?`, message: 'This cannot be undone.', confirmLabel: 'Delete', danger: true })
  if (!ok) return
  try {
    await $fetch(`/api/admin/${config.apiKey}/${id}`, { method: 'DELETE' })
    toast.success(`${config.singular} deleted`)
    await navigateTo(`/admin/${config.path}`)
  } catch (err) { toast.error(errorMessage(err)) }
}
</script>

<template>
  <div>
    <NuxtLink :to="`/admin/${config.path}`" class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent"><AppIcon name="arrow-left" :size="16" /> {{ config.plural }}</NuxtLink>
    <AdminPageHeader :title="isNew ? `New ${config.singular.toLowerCase()}` : String(data[config.nameField] || `Edit ${config.singular.toLowerCase()}`)" :description="isNew ? config.description : undefined" />

    <p v-if="loadError" class="card p-6 text-danger" role="alert">{{ loadError }}</p>
    <div v-else-if="loading" class="space-y-4"><div v-for="n in 3" :key="n" class="skeleton h-40" /></div>

    <form v-else novalidate class="space-y-6" @submit.prevent="save">
      <section v-for="s in config.sections" :key="s.title" class="card p-5 sm:p-6" :aria-labelledby="`sec-${s.title}`">
        <h2 :id="`sec-${s.title}`" class="text-lg font-bold text-ink">{{ s.title }}</h2>
        <p v-if="s.description" class="mt-1 text-sm text-muted">{{ s.description }}</p>
        <div class="mt-5 grid gap-5 sm:grid-cols-2">
          <AdminFieldRenderer v-for="f in s.fields" :key="f.key" v-model="data[f.key]" :field="f" :path="f.key" :errors="errors" />
        </div>
      </section>

      <div class="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <button v-if="!isNew" type="button" class="btn btn-ghost btn-sm text-danger" @click="remove"><AppIcon name="trash" :size="16" /> Delete</button>
        <span v-else />
        <div class="flex items-center gap-2">
          <a v-if="!isNew && config.publicUrl && data.status === 'published'" :href="config.publicUrl(data) ?? '#'" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">View on site <AppIcon name="external-link" :size="14" /></a>
          <NuxtLink :to="`/admin/${config.path}`" class="btn btn-secondary btn-sm">Cancel</NuxtLink>
          <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">{{ saving ? 'Saving…' : isNew ? 'Create' : 'Save changes' }}</button>
        </div>
      </div>
    </form>
  </div>
</template>
