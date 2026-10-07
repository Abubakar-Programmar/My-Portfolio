<script setup lang="ts">
import { settingSchemas, type SettingGroup } from '#shared/schemas/settings'

const props = defineProps<{ group: SettingGroup }>()
const toast = useToast()
const panel = computed(() => settingsPanels[props.group])

const { data: all, refresh } = await useFetch('/api/admin/settings', { key: 'admin-settings' })
const data = ref<Record<string, unknown>>({})
const errors = ref<Record<string, string>>({})
const saving = ref(false)

watchEffect(() => {
  if (all.value) data.value = structuredClone(toRaw((all.value as unknown as Record<string, Record<string, unknown>>)[props.group]!))
})

async function save() {
  errors.value = {}
  const payload = Object.fromEntries(Object.entries(data.value).map(([k, v]) => [k, v === null ? '' : v]))
  const parsed = settingSchemas[props.group].safeParse(payload)
  if (!parsed.success) {
    for (const i of parsed.error.issues) errors.value[i.path.join('.')] ??= i.message
    toast.error(`Please fix: ${parsed.error.issues[0]?.message}`)
    return
  }
  saving.value = true
  try {
    await $fetch(`/api/admin/settings/${props.group}`, { method: 'PUT', body: parsed.data })
    toast.success('Settings saved')
    await refresh()
    await refreshNuxtData('site')
  } catch (err) {
    errors.value = fieldErrors(err)
    toast.error(errorMessage(err))
  } finally { saving.value = false }
}
</script>

<template>
  <form novalidate class="space-y-6" @submit.prevent="save">
    <section v-for="s in panel.sections" :key="s.title" class="card p-5 sm:p-6">
      <h2 class="text-lg font-bold text-ink">{{ s.title }}</h2>
      <p v-if="s.description" class="mt-1 text-sm text-muted">{{ s.description }}</p>
      <div class="mt-5 grid gap-5 sm:grid-cols-2">
        <AdminFieldRenderer v-for="f in s.fields" :key="f.key" v-model="data[f.key]" :field="f" :path="f.key" :errors="errors" />
      </div>
    </section>
    <div class="flex justify-end"><button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save settings' }}</button></div>
  </form>
</template>
