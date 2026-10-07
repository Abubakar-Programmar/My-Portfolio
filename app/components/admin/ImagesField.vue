<script setup lang="ts">
const model = defineModel<string[]>({ default: () => [] })
const open = ref(false)
const dragFrom = ref<number | null>(null)
const dragOver = ref<number | null>(null)

function add(urls: string[]) {
  model.value = [...model.value, ...urls.filter(u => !model.value.includes(u))]
}
function drop(to: number) {
  if (dragFrom.value === null || dragFrom.value === to) return
  const next = [...model.value]
  const [moved] = next.splice(dragFrom.value, 1)
  next.splice(to, 0, moved!)
  model.value = next
  dragFrom.value = dragOver.value = null
}
function move(i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= model.value.length) return
  const next = [...model.value]
  ;[next[i], next[j]] = [next[j]!, next[i]!]
  model.value = next
}
</script>

<template>
  <div>
    <ul v-if="model.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      <li
        v-for="(url, i) in model"
        :key="url"
        draggable="true"
        class="group relative aspect-[4/3] cursor-grab overflow-hidden rounded-xl border-2 bg-surface transition active:cursor-grabbing"
        :class="dragOver === i ? 'border-accent' : 'border-line'"
        @dragstart="dragFrom = i"
        @dragover.prevent="dragOver = i"
        @dragleave="dragOver = null"
        @drop.prevent="drop(i)"
        @dragend="dragFrom = dragOver = null"
      >
        <img :src="url.startsWith('/media/') ? `${url}?w=320` : url" alt="" class="h-full w-full object-cover" draggable="false">
        <span class="absolute left-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-xs font-bold text-ink">{{ i + 1 }}</span>
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/70 to-transparent p-1.5 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <span class="flex gap-1">
            <button type="button" class="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-ink disabled:opacity-40" :disabled="i === 0" aria-label="Move earlier" @click="move(i, -1)"><AppIcon name="chevron-left" :size="14" /></button>
            <button type="button" class="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-ink disabled:opacity-40" :disabled="i === model.length - 1" aria-label="Move later" @click="move(i, 1)"><AppIcon name="chevron-right" :size="14" /></button>
          </span>
          <button type="button" class="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-danger" aria-label="Remove image" @click="model = model.filter(u => u !== url)"><AppIcon name="trash" :size="14" /></button>
        </div>
      </li>
    </ul>
    <button type="button" class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line py-6 text-sm font-medium text-muted transition hover:border-accent hover:text-accent" @click="open = true">
      <AppIcon name="plus" :size="18" /> Add images
    </button>
    <AdminMediaPicker :open="open" multiple @close="open = false" @select="add" />
  </div>
</template>
