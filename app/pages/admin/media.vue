<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Media library' })

interface Asset { id: string; filename: string; originalName: string; mime: string; size: number; alt: string; width: number | null; height: number | null; url: string }
const toast = useToast()
const search = ref('')
const page = ref(1)
const debounced = refDebounced(search, 300)
watch(debounced, () => (page.value = 1))
const { data, status, refresh } = useFetch<{ items: Asset[]; total: number; pageSize: number }>('/api/admin/media', { query: computed(() => ({ q: debounced.value || undefined, page: page.value, pageSize: 24 })), key: 'admin-media' })
const pages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / 24)))

const uploading = ref(false)
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const editing = ref<Asset | null>(null)
const alt = ref('')

async function upload(files: FileList | File[]) {
  const list = [...files]
  if (!list.length) return
  const body = new FormData()
  list.forEach(f => body.append('file', f))
  uploading.value = true
  try {
    await $fetch('/api/admin/media', { method: 'POST', body })
    toast.success(`${list.length} file${list.length === 1 ? '' : 's'} uploaded`)
    await refresh()
  } catch (err) { toast.error(errorMessage(err)) } finally { uploading.value = false; dragOver.value = false }
}

function edit(a: Asset) { editing.value = a; alt.value = a.alt }
async function saveAlt() {
  if (!editing.value) return
  try {
    await $fetch(`/api/admin/media/${editing.value.id}`, { method: 'PATCH', body: { alt: alt.value } })
    toast.success('Alt text saved')
    editing.value = null
    await refresh()
  } catch (err) { toast.error(errorMessage(err)) }
}
async function remove(a: Asset) {
  const ok = await useConfirm().confirm({ title: 'Delete this file?', message: `“${a.originalName}” will be removed from the library. Files that are in use cannot be deleted.`, confirmLabel: 'Delete', danger: true })
  if (!ok) return
  try {
    await $fetch(`/api/admin/media/${a.id}`, { method: 'DELETE' })
    toast.success('File deleted')
    editing.value = null
    await refresh()
  } catch (err) { toast.error(errorMessage(err)) }
}
const copy = async (a: Asset) => { await navigator.clipboard.writeText(`${location.origin}${a.url}`).then(() => toast.success('URL copied')).catch(() => toast.error('Could not copy')) }
const size = (b: number) => (b > 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)
</script>

<template>
  <div @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="upload($event.dataTransfer?.files ?? [])">
    <AdminPageHeader title="Media library" description="Images and PDFs. Images are optimised to WebP and resized on demand.">
      <button type="button" class="btn btn-primary btn-sm" :disabled="uploading" @click="fileInput?.click()"><AppIcon name="upload" :size="16" /> {{ uploading ? 'Uploading…' : 'Upload files' }}</button>
      <input ref="fileInput" type="file" multiple accept="image/*,application/pdf" class="hidden" @change="upload(($event.target as HTMLInputElement).files ?? [])">
    </AdminPageHeader>

    <div class="relative mb-4 max-w-sm"><label for="media-q" class="sr-only">Search files</label><AppIcon name="search" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input id="media-q" v-model="search" type="search" class="input pl-10" placeholder="Search files or alt text…"></div>

    <div class="rounded-2xl border-2 border-dashed p-4 transition sm:p-5" :class="dragOver ? 'border-accent bg-accent-soft' : 'border-transparent'">
      <div v-if="status === 'pending' && !data" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"><div v-for="n in 12" :key="n" class="skeleton aspect-square" /></div>
      <ul v-else-if="data?.items.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <li v-for="a in data.items" :key="a.id" class="card overflow-hidden">
          <button type="button" class="block aspect-square w-full bg-surface" :aria-label="`Edit ${a.originalName}`" @click="edit(a)">
            <img v-if="a.mime.startsWith('image/')" :src="`${a.url}?w=320`" :alt="a.alt" class="h-full w-full object-cover" loading="lazy">
            <span v-else class="grid h-full place-items-center text-muted"><AppIcon name="file" :size="36" /></span>
          </button>
          <div class="p-3"><p class="truncate text-sm font-medium text-ink" :title="a.originalName">{{ a.originalName }}</p><p class="text-xs text-muted">{{ size(a.size) }}<template v-if="a.width"> · {{ a.width }}×{{ a.height }}</template></p><p v-if="a.mime.startsWith('image/') && !a.alt" class="mt-1 text-xs font-medium text-warn">Missing alt text</p></div>
        </li>
      </ul>
      <div v-else class="grid min-h-[16rem] place-items-center text-center"><div><AppIcon name="image" :size="40" class="mx-auto text-muted" /><p class="mt-3 font-semibold text-ink">No files yet</p><p class="text-sm text-muted">Drag files here or use the Upload button.</p></div></div>
    </div>

    <nav v-if="pages > 1" class="mt-4 flex items-center justify-end gap-2 text-sm text-muted" aria-label="Pagination">
      <button type="button" class="btn btn-secondary btn-sm" :disabled="page <= 1" @click="page--">Previous</button><span>Page {{ page }} / {{ pages }}</span><button type="button" class="btn btn-secondary btn-sm" :disabled="page >= pages" @click="page++">Next</button>
    </nav>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="editing" class="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm" @click.self="editing = null">
          <div class="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-lift" role="dialog" aria-modal="true" aria-label="Edit file">
            <img v-if="editing.mime.startsWith('image/')" :src="`${editing.url}?w=800`" :alt="editing.alt" class="max-h-64 w-full rounded-xl bg-surface object-contain">
            <p class="mt-4 break-all text-sm text-muted">{{ editing.url }}</p>
            <label for="alt" class="label mt-4">Alt text</label>
            <input id="alt" v-model="alt" type="text" class="input" placeholder="Describe the image for people using screen readers" maxlength="300">
            <div class="mt-6 flex flex-wrap items-center justify-between gap-2">
              <button type="button" class="btn btn-ghost btn-sm text-danger" @click="remove(editing)"><AppIcon name="trash" :size="16" /> Delete</button>
              <div class="flex gap-2"><button type="button" class="btn btn-secondary btn-sm" @click="copy(editing)"><AppIcon name="copy" :size="16" /> Copy URL</button><button type="button" class="btn btn-secondary btn-sm" @click="editing = null">Close</button><button type="button" class="btn btn-primary btn-sm" @click="saveAlt">Save</button></div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
