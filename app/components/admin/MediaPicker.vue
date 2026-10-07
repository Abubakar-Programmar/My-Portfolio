<script setup lang="ts">
interface Asset { id: string; filename: string; originalName: string; mime: string; alt: string; width: number | null; height: number | null; url: string }

const props = withDefaults(defineProps<{ open: boolean; multiple?: boolean; kind?: 'image' | 'pdf' }>(), { kind: 'image' })
const emit = defineEmits<{ close: []; select: [urls: string[]] }>()
const toast = useToast()

const items = ref<Asset[]>([])
const loading = ref(false)
const uploading = ref(false)
const search = ref('')
const picked = ref<string[]>([])
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await $fetch<{ items: Asset[] }>('/api/admin/media', { query: { q: search.value || undefined, kind: props.kind, pageSize: 60 } })
    items.value = res.items
  } catch (err) {
    toast.error(errorMessage(err))
  } finally {
    loading.value = false
  }
}

watch(() => props.open, (v) => { if (v) { picked.value = []; load() } })
watch(search, useDebounceFn(load, 250))

async function upload(files: FileList | File[]) {
  const list = [...files]
  if (!list.length) return
  const body = new FormData()
  list.forEach(f => body.append('file', f))
  uploading.value = true
  try {
    const created = await $fetch<Asset[]>('/api/admin/media', { method: 'POST', body })
    items.value = [...created.map(c => ({ ...c, url: `/media/${c.filename}` })), ...items.value]
    picked.value = props.multiple ? [...picked.value, ...created.map(c => `/media/${c.filename}`)] : [`/media/${created[0]!.filename}`]
    toast.success(`${created.length} file${created.length === 1 ? '' : 's'} uploaded`)
  } catch (err) {
    toast.error(errorMessage(err))
  } finally {
    uploading.value = false
    dragOver.value = false
  }
}

function toggle(url: string) {
  if (!props.multiple) { picked.value = [url]; return }
  picked.value = picked.value.includes(url) ? picked.value.filter(u => u !== url) : [...picked.value, url]
}
function confirm() {
  emit('select', picked.value)
  emit('close')
}
useEventListener('keydown', (e: KeyboardEvent) => { if (props.open && e.key === 'Escape') emit('close') })
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-3 backdrop-blur-sm sm:p-6" @click.self="emit('close')">
        <div
          class="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-lift"
          role="dialog" aria-modal="true" aria-label="Media library"
          @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="upload($event.dataTransfer?.files ?? [])"
        >
          <div class="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <h2 class="text-lg font-bold text-ink">{{ kind === 'pdf' ? 'Choose a PDF' : 'Choose an image' }}</h2>
            <input v-model="search" type="search" class="input ml-auto h-10 max-w-[14rem]" placeholder="Search files…" aria-label="Search media">
            <button type="button" class="btn btn-secondary btn-sm" :disabled="uploading" @click="fileInput?.click()"><AppIcon name="upload" :size="16" /> {{ uploading ? 'Uploading…' : 'Upload' }}</button>
            <input ref="fileInput" type="file" class="hidden" :multiple="multiple" :accept="kind === 'pdf' ? 'application/pdf' : 'image/*'" @change="upload(($event.target as HTMLInputElement).files ?? [])">
            <button type="button" class="btn btn-ghost btn-icon" aria-label="Close" @click="emit('close')"><AppIcon name="x" /></button>
          </div>

          <div class="relative min-h-[18rem] flex-1 overflow-y-auto p-4" :class="dragOver ? 'bg-accent-soft' : ''">
            <p v-if="dragOver" class="pointer-events-none absolute inset-4 grid place-items-center rounded-xl border-2 border-dashed border-accent font-semibold text-accent-dark">Drop files to upload</p>
            <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5"><div v-for="n in 10" :key="n" class="skeleton aspect-square" /></div>
            <ul v-else-if="items.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              <li v-for="a in items" :key="a.id">
                <button type="button" class="group relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-surface transition" :class="picked.includes(a.url) ? 'border-accent ring-2 ring-accent/30' : 'border-transparent hover:border-line'" :aria-pressed="picked.includes(a.url)" :aria-label="a.alt || a.originalName" @click="toggle(a.url)">
                  <img v-if="a.mime.startsWith('image/')" :src="`${a.url}?w=240`" :alt="a.alt" class="h-full w-full object-cover" loading="lazy">
                  <span v-else class="grid h-full place-items-center p-2 text-center text-xs font-medium text-body"><AppIcon name="file" :size="28" /><span class="mt-1 line-clamp-2 break-all">{{ a.originalName }}</span></span>
                  <span v-if="picked.includes(a.url)" class="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-accent text-white"><AppIcon name="check" :size="14" /></span>
                </button>
              </li>
            </ul>
            <div v-else class="grid min-h-[14rem] place-items-center text-center text-muted">
              <div><AppIcon name="image" :size="36" class="mx-auto" /><p class="mt-2 font-medium text-ink">No files yet</p><p class="text-sm">Upload or drop files here.</p></div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-line p-4">
            <p class="text-sm text-muted">{{ picked.length }} selected</p>
            <div class="flex gap-2">
              <button type="button" class="btn btn-secondary btn-sm" @click="emit('close')">Cancel</button>
              <button type="button" class="btn btn-primary btn-sm" :disabled="!picked.length" @click="confirm">Use {{ multiple ? 'selected' : 'file' }}</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
