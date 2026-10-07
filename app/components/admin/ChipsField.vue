<script setup lang="ts">
const model = defineModel<string[]>({ default: () => [] })
defineProps<{ placeholder?: string; id?: string }>()
const draft = ref('')

function add() {
  const parts = draft.value.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length) model.value = [...new Set([...model.value, ...parts])]
  draft.value = ''
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
    <span v-for="chip in model" :key="chip" class="badge badge-accent gap-1.5 py-1 pl-3 pr-1.5 text-sm">
      {{ chip }}
      <button type="button" class="grid h-5 w-5 place-items-center rounded-full hover:bg-accent/15" :aria-label="`Remove ${chip}`" @click="model = model.filter(c => c !== chip)"><AppIcon name="x" :size="12" /></button>
    </span>
    <input :id="id" v-model="draft" type="text" class="min-w-[8rem] flex-1 bg-transparent px-2 py-1.5 text-[0.95rem] text-ink placeholder:text-muted/70 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" :placeholder="placeholder" @keydown.enter.prevent="add" @keydown.,.prevent="add" @blur="add">
  </div>
</template>
