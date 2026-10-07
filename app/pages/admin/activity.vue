<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Activity log' })

const page = ref(1)
const { data, status } = useFetch('/api/admin/activity', { query: computed(() => ({ page: page.value })), key: 'admin-activity' })
const pages = computed(() => Math.max(1, Math.ceil((data.value?.total ?? 0) / (data.value?.pageSize ?? 30))))
const tone: Record<string, string> = { create: 'badge-green', update: 'badge-accent', delete: 'badge-red', duplicate: 'badge-gray', login: 'badge-gray', security: 'badge-amber', reply: 'badge-accent', export: 'badge-gray' }
</script>

<template>
  <div>
    <AdminPageHeader title="Activity log" description="Who changed what, and when." />
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[40rem] text-left text-sm">
          <thead class="border-b border-line bg-surface text-xs font-semibold uppercase tracking-wider text-muted"><tr><th class="px-4 py-3">When</th><th class="px-4 py-3">Who</th><th class="px-4 py-3">Action</th><th class="px-4 py-3">Details</th></tr></thead>
          <tbody class="divide-y divide-line">
            <tr v-if="status === 'pending' && !data"><td colspan="4" class="p-4"><div class="skeleton h-24" /></td></tr>
            <tr v-for="a in data?.items ?? []" :key="a.id" class="hover:bg-paper">
              <td class="whitespace-nowrap px-4 py-3 text-muted">{{ formatDateTime(a.createdAt) }}</td>
              <td class="px-4 py-3">{{ a.actor }}</td>
              <td class="px-4 py-3"><span class="badge capitalize" :class="tone[a.action] ?? 'badge-gray'">{{ a.action }}</span></td>
              <td class="px-4 py-3 text-ink">{{ a.summary }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="data && !data.items.length" class="p-10 text-center text-muted">No activity recorded yet.</p>
    </div>
    <nav v-if="pages > 1" class="mt-4 flex items-center justify-end gap-2 text-sm text-muted" aria-label="Pagination">
      <button type="button" class="btn btn-secondary btn-sm" :disabled="page <= 1" @click="page--">Previous</button><span>Page {{ page }} / {{ pages }}</span><button type="button" class="btn btn-secondary btn-sm" :disabled="page >= pages" @click="page++">Next</button>
    </nav>
  </div>
</template>
