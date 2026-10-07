<script setup lang="ts">
const model = defineModel<string | null>({ default: null })
withDefaults(defineProps<{ kind?: 'image' | 'pdf'; label?: string }>(), { kind: 'image', label: 'image' })
const open = ref(false)
</script>

<template>
  <div>
    <div v-if="model" class="flex items-center gap-4 rounded-xl border border-line p-3">
      <img v-if="kind === 'image'" :src="model.startsWith('/media/') ? `${model}?w=240` : model" alt="" class="h-20 w-28 rounded-lg bg-surface object-cover">
      <span v-else class="grid h-20 w-20 place-items-center rounded-lg bg-surface text-muted"><AppIcon name="file" :size="28" /></span>
      <p class="min-w-0 flex-1 truncate text-sm text-muted">{{ model }}</p>
      <button type="button" class="btn btn-secondary btn-sm" @click="open = true">Change</button>
      <button type="button" class="btn btn-ghost btn-sm text-danger" @click="model = null">Remove</button>
    </div>
    <button v-else type="button" class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line py-8 text-sm font-medium text-muted transition hover:border-accent hover:text-accent" @click="open = true">
      <AppIcon :name="kind === 'pdf' ? 'file' : 'image'" :size="20" /> Choose {{ label }}
    </button>
    <AdminMediaPicker :open="open" :kind="kind" @close="open = false" @select="model = $event[0] ?? null" />
  </div>
</template>
