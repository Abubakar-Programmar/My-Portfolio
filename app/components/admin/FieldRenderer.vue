<script setup lang="ts">
import type { Field } from '~/utils/adminResources'

const props = defineProps<{ field: Field; path: string; errors: Record<string, string> }>()
const model = defineModel<unknown>()

const id = computed(() => `f-${props.path.replace(/\./g, '-')}`)
const error = computed(() => {
  if (props.errors[props.path]) return props.errors[props.path]
  const nested = Object.keys(props.errors).find(k => k.startsWith(`${props.path}.`))
  return nested ? props.errors[nested] : ''
})
const invalid = computed(() => Boolean(error.value))

// Dynamic <select> options (categories, services).
const remote = props.field.type === 'select' && props.field.optionsFrom
  ? useFetch<{ items: Record<string, string>[] }>(`/api/admin/${props.field.optionsFrom}`, { query: { pageSize: 100 }, key: `opts-${props.field.optionsFrom}` })
  : null
const options = computed(() => {
  if (props.field.type !== 'select') return []
  if (props.field.options) return props.field.options
  return (remote?.data.value?.items ?? []).map(i => ({ value: i.id!, label: i.title ?? i.name ?? i.id! }))
})

const fileModel = computed<string | null>({ get: () => (model.value as string | null) ?? null, set: v => (model.value = v) })
const numberValue = computed(() => (model.value === null || model.value === undefined ? '' : Number(model.value)))
const textModel = computed({ get: () => String(model.value ?? ''), set: (v: string) => (model.value = v) })

const datetimeValue = computed({
  get: () => {
    if (!model.value) return ''
    const d = new Date(String(model.value))
    if (Number.isNaN(d.getTime())) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  },
  set: (v: string) => (model.value = v ? new Date(v).toISOString() : null)
})

const listItems = computed(() => (Array.isArray(model.value) ? (model.value as Record<string, unknown>[]) : []))

function blankItem(fields: Field[]): Record<string, unknown> {
  return Object.fromEntries(fields.map(f => [f.key, f.type === 'strings' || f.type === 'chips' || f.type === 'objects' || f.type === 'images' ? [] : f.type === 'toggle' ? false : '']))
}
function addItem(fields: Field[]) { model.value = [...listItems.value, blankItem(fields)] }
function removeItem(i: number) { model.value = listItems.value.filter((_, idx) => idx !== i) }
function moveItem(i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= listItems.value.length) return
  const next = [...listItems.value]
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  model.value = next
}
function setItemValue(i: number, key: string, value: unknown) {
  model.value = listItems.value.map((item, idx) => (idx === i ? { ...item, [key]: value } : item))
}
</script>

<template>
  <div :class="{ 'sm:col-span-2': !('half' in field && field.half) }">
    <!-- Toggle -->
    <label v-if="field.type === 'toggle'" :for="id" class="flex cursor-pointer items-center gap-3">
      <input :id="id" v-model="model" type="checkbox" class="peer sr-only" role="switch">
      <span class="relative h-6 w-11 shrink-0 rounded-full bg-line transition peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
      <span class="text-sm font-medium text-ink">{{ field.label }}</span>
    </label>

    <template v-else>
      <label :for="id" class="label">{{ field.label }}</label>

      <input v-if="field.type === 'text' || field.type === 'url'" :id="id" v-model="textModel" :type="field.type === 'url' ? 'url' : 'text'" class="input" :class="{ 'input-error': invalid }" :placeholder="field.placeholder" :aria-invalid="invalid">
      <textarea v-else-if="field.type === 'textarea'" :id="id" v-model="textModel" class="input" :class="{ 'input-error': invalid }" :rows="field.rows ?? 4" :placeholder="field.placeholder" :aria-invalid="invalid" />
      <input v-else-if="field.type === 'number'" :id="id" :value="numberValue" type="number" class="input" :class="{ 'input-error': invalid }" @input="model = ($event.target as HTMLInputElement).value === '' ? null : Number(($event.target as HTMLInputElement).value)">
      <input v-else-if="field.type === 'datetime'" :id="id" v-model="datetimeValue" type="datetime-local" class="input" :class="{ 'input-error': invalid }">
      <select v-else-if="field.type === 'select'" :id="id" :value="(model ?? '') as string" class="input" :class="{ 'input-error': invalid }" @change="model = ($event.target as HTMLSelectElement).value || null">
        <option v-if="field.emptyLabel" value="">{{ field.emptyLabel }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>

      <AdminRichTextEditor v-else-if="field.type === 'richtext'" v-model="model as string" />
      <AdminImageField v-else-if="field.type === 'image'" v-model="fileModel" />
      <AdminImageField v-else-if="field.type === 'pdf'" v-model="fileModel" kind="pdf" label="PDF" />
      <AdminImagesField v-else-if="field.type === 'images'" v-model="model as string[]" />
      <AdminChipsField v-else-if="field.type === 'chips'" :id="id" v-model="model as string[]" :placeholder="field.placeholder" />
      <AdminStringListField v-else-if="field.type === 'strings'" v-model="model as string[]" :placeholder="field.placeholder" />

      <div v-else-if="field.type === 'objects'" class="space-y-3">
        <fieldset v-for="(item, i) in listItems" :key="i" class="rounded-xl border border-line bg-paper p-4">
          <legend class="px-2 text-sm font-semibold text-ink">{{ field.itemLabel }} {{ i + 1 }}</legend>
          <div class="grid gap-4 sm:grid-cols-2">
            <AdminFieldRenderer
              v-for="sub in field.fields"
              :key="sub.key"
              :field="sub"
              :path="`${path}.${i}.${sub.key}`"
              :errors="errors"
              :model-value="item[sub.key]"
              @update:model-value="setItemValue(i, sub.key, $event)"
            />
          </div>
          <div class="mt-3 flex justify-end gap-1">
            <button type="button" class="btn btn-ghost btn-sm" :disabled="i === 0" @click="moveItem(i, -1)"><AppIcon name="chevron-up" :size="16" /> Up</button>
            <button type="button" class="btn btn-ghost btn-sm" :disabled="i === listItems.length - 1" @click="moveItem(i, 1)"><AppIcon name="chevron-down" :size="16" /> Down</button>
            <button type="button" class="btn btn-ghost btn-sm text-danger" @click="removeItem(i)"><AppIcon name="trash" :size="16" /> Remove</button>
          </div>
        </fieldset>
        <button type="button" class="btn btn-secondary btn-sm" @click="addItem(field.fields)"><AppIcon name="plus" :size="16" /> Add {{ field.itemLabel.toLowerCase() }}</button>
      </div>

      <p v-if="'hint' in field && field.hint && !error" class="hint">{{ field.hint }}</p>
      <p v-if="error" class="field-error" role="alert">{{ error }}</p>
    </template>
  </div>
</template>
