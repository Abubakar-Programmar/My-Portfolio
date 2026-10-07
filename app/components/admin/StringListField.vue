<script setup lang="ts">
const model = defineModel<string[]>({ default: () => [] })
defineProps<{ placeholder?: string }>()

const add = () => (model.value = [...model.value, ''])
const remove = (i: number) => (model.value = model.value.filter((_, idx) => idx !== i))
const update = (i: number, v: string) => (model.value = model.value.map((x, idx) => (idx === i ? v : x)))
function move(i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= model.value.length) return
  const next = [...model.value]
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  model.value = next
}
</script>

<template>
  <div class="space-y-2">
    <div v-for="(item, i) in model" :key="i" class="flex items-center gap-2">
      <input :value="item" type="text" class="input" :placeholder="placeholder" :aria-label="`Item ${i + 1}`" @input="update(i, ($event.target as HTMLInputElement).value)">
      <button type="button" class="btn btn-ghost btn-icon shrink-0" aria-label="Move up" :disabled="i === 0" @click="move(i, -1)"><AppIcon name="chevron-up" :size="18" /></button>
      <button type="button" class="btn btn-ghost btn-icon shrink-0" aria-label="Move down" :disabled="i === model.length - 1" @click="move(i, 1)"><AppIcon name="chevron-down" :size="18" /></button>
      <button type="button" class="btn btn-ghost btn-icon shrink-0 text-danger" aria-label="Remove item" @click="remove(i)"><AppIcon name="trash" :size="18" /></button>
    </div>
    <button type="button" class="btn btn-secondary btn-sm" @click="add"><AppIcon name="plus" :size="16" /> Add item</button>
  </div>
</template>
