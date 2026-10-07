<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const toast = useToast()
const cfg = findResource(String(route.params.resource))
if (!cfg) throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
const config = cfg

useHead({ title: config.plural })

const search = ref('')
const status = ref('')
const page = ref(1)
const debounced = refDebounced(search, 300)
watch([debounced, status], () => (page.value = 1))

const { data, status: fetchStatus, refresh } = useFetch<{ items: Record<string, unknown>[]; total: number; pageSize: number }>(() => `/api/admin/${config.apiKey}`, {
  query: computed(() => ({ q: debounced.value || undefined, status: status.value || undefined, page: page.value, pageSize: 15 })),
  key: `admin-list-${config.path}`
})
const pages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / (data.value?.pageSize ?? 15))))

async function remove(row: Record<string, unknown>) {
  const ok = await useConfirm().confirm({ title: `Delete this ${config.singular.toLowerCase()}?`, message: `“${row[config.nameField]}” will be permanently removed.`, confirmLabel: 'Delete', danger: true })
  if (!ok) return
  try {
    await $fetch(`/api/admin/${config.apiKey}/${row.id}`, { method: 'DELETE' })
    toast.success(`${config.singular} deleted`)
    await refresh()
  } catch (err) { toast.error(errorMessage(err)) }
}

async function duplicate(row: Record<string, unknown>) {
  try {
    const copy = await $fetch<{ id: string }>(`/api/admin/${config.apiKey}/${row.id}/duplicate`, { method: 'POST' })
    toast.success('Duplicated as a draft')
    await navigateTo(`/admin/${config.path}/${copy.id}`)
  } catch (err) { toast.error(errorMessage(err)) }
}

function cell(row: Record<string, unknown>, key: string) {
  const v = row[key]
  return v === null || v === undefined || v === '' ? '—' : String(v)
}
</script>

<template>
  <div>
    <AdminPageHeader :title="config.plural" :description="config.description">
      <NuxtLink :to="`/admin/${config.path}/new`" class="btn btn-primary btn-sm"><AppIcon name="plus" :size="16" /> New {{ config.singular.toLowerCase() }}</NuxtLink>
    </AdminPageHeader>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row">
      <div class="relative flex-1 sm:max-w-sm">
        <label :for="`q-${config.path}`" class="sr-only">Search {{ config.plural }}</label>
        <AppIcon name="search" :size="18" class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input :id="`q-${config.path}`" v-model="search" type="search" class="input pl-10" :placeholder="`Search ${config.plural.toLowerCase()}…`">
      </div>
      <select v-if="config.statusFilter" v-model="status" class="input sm:w-44" aria-label="Filter by status">
        <option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option v-if="config.path === 'blog'" value="scheduled">Scheduled</option>
      </select>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[40rem] text-left text-sm">
          <thead class="border-b border-line bg-surface text-xs font-semibold uppercase tracking-wider text-muted">
            <tr><th v-for="c in config.columns" :key="c.key" class="px-4 py-3" scope="col">{{ c.label }}</th><th class="px-4 py-3 text-right" scope="col"><span class="sr-only">Actions</span></th></tr>
          </thead>
          <tbody class="divide-y divide-line">
            <template v-if="fetchStatus === 'pending' && !data">
              <tr v-for="n in 6" :key="n"><td :colspan="config.columns.length + 1" class="px-4 py-3"><div class="skeleton h-8" /></td></tr>
            </template>
            <tr v-for="row in data?.items ?? []" :key="String(row.id)" class="transition-colors hover:bg-paper">
              <td v-for="c in config.columns" :key="c.key" class="px-4 py-3 align-middle">
                <img v-if="c.kind === 'image'" :src="row[c.key] ? `${row[c.key]}${String(row[c.key]).startsWith('/media/') ? '?w=120' : ''}` : undefined" alt="" class="h-10 w-14 rounded-lg bg-surface object-cover">
                <AdminStatusBadge v-else-if="c.kind === 'status'" :status="String(row[c.key])" />
                <span v-else-if="c.kind === 'bool'">{{ row[c.key] ? 'Yes' : '—' }}</span>
                <span v-else-if="c.kind === 'date'" class="whitespace-nowrap text-muted">{{ row[c.key] ? formatDate(String(row[c.key])) : '—' }}</span>
                <NuxtLink v-else-if="c.kind === 'strong'" :to="`/admin/${config.path}/${row.id}`" class="font-semibold text-ink hover:text-accent">{{ cell(row, c.key) }}</NuxtLink>
                <span v-else class="text-body">{{ cell(row, c.key) }}</span>
              </td>
              <td class="whitespace-nowrap px-4 py-3 text-right">
                <a v-if="config.publicUrl && row.status === 'published'" :href="config.publicUrl(row) ?? '#'" target="_blank" rel="noopener" class="btn btn-ghost btn-icon" :aria-label="`View ${row[config.nameField]} on the site`"><AppIcon name="external-link" :size="18" /></a>
                <NuxtLink :to="`/admin/${config.path}/${row.id}`" class="btn btn-ghost btn-icon" :aria-label="`Edit ${row[config.nameField]}`"><AppIcon name="edit" :size="18" /></NuxtLink>
                <button v-if="config.duplicable" type="button" class="btn btn-ghost btn-icon" :aria-label="`Duplicate ${row[config.nameField]}`" @click="duplicate(row)"><AppIcon name="copy" :size="18" /></button>
                <button type="button" class="btn btn-ghost btn-icon text-danger" :aria-label="`Delete ${row[config.nameField]}`" @click="remove(row)"><AppIcon name="trash" :size="18" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="data && !data.items.length" class="px-6 py-14 text-center">
        <p class="font-semibold text-ink">No {{ config.plural.toLowerCase() }} found</p>
        <NuxtLink :to="`/admin/${config.path}/new`" class="btn btn-primary btn-sm mt-4">Create the first one</NuxtLink>
      </div>
    </div>

    <nav v-if="pages > 1" class="mt-4 flex items-center justify-between text-sm text-muted" aria-label="Pagination">
      <span>{{ data?.total }} total</span>
      <div class="flex items-center gap-2">
        <button type="button" class="btn btn-secondary btn-sm" :disabled="page <= 1" @click="page--">Previous</button>
        <span>Page {{ page }} / {{ pages }}</span>
        <button type="button" class="btn btn-secondary btn-sm" :disabled="page >= pages" @click="page++">Next</button>
      </div>
    </nav>
  </div>
</template>
