<script setup lang="ts">
interface Item { group: string; label: string; to: string }

const { open, close, toggle } = useCommandPalette()
const router = useRouter()
const query = ref('')
const results = ref<Item[]>([])
const active = ref(0)
const input = ref<HTMLInputElement | null>(null)

const pages: Item[] = [
  { group: 'Pages', label: 'Home', to: '/' },
  { group: 'Pages', label: 'About', to: '/about' },
  { group: 'Pages', label: 'Services', to: '/services' },
  { group: 'Pages', label: 'Projects', to: '/projects' },
  { group: 'Pages', label: 'Blog', to: '/blog' },
  { group: 'Pages', label: 'Testimonials', to: '/testimonials' },
  { group: 'Pages', label: 'Contact', to: '/contact' }
]

const items = computed(() => {
  const q = query.value.trim().toLowerCase()
  const matchedPages = q ? pages.filter(p => p.label.toLowerCase().includes(q)) : pages
  return [...matchedPages, ...results.value]
})

watch(query, useDebounceFn(async (q: string) => {
  active.value = 0
  if (q.trim().length < 2) { results.value = []; return }
  results.value = await $fetch<Item[]>('/api/search', { query: { q: q.trim() } }).catch(() => [])
}, 200))

watch(open, async (v) => {
  if (!v) return
  query.value = ''
  results.value = []
  active.value = 0
  await nextTick()
  input.value?.focus()
})

function go(item?: Item) {
  if (!item) return
  close()
  router.push(item.to)
}

function onKey(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    toggle()
  } else if (open.value && e.key === 'Escape') close()
  else if (open.value && e.key === 'ArrowDown') { e.preventDefault(); active.value = Math.min(active.value + 1, items.value.length - 1) }
  else if (open.value && e.key === 'ArrowUp') { e.preventDefault(); active.value = Math.max(active.value - 1, 0) }
  else if (open.value && e.key === 'Enter') { e.preventDefault(); go(items.value[active.value]) }
}
useEventListener('keydown', onKey)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[70] flex items-start justify-center bg-ink/40 p-4 pt-[12vh] backdrop-blur-sm" @click.self="close">
        <div class="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-lift" role="dialog" aria-modal="true" aria-label="Command palette">
          <div class="flex items-center gap-3 border-b border-line px-4">
            <AppIcon name="search" class="text-muted" />
            <input
              ref="input"
              v-model="query"
              type="text"
              class="h-14 w-full bg-transparent text-base text-ink placeholder:text-muted focus:outline-none focus-visible:rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Search pages, services, projects, posts…"
              aria-label="Search"
              role="combobox"
              aria-expanded="true"
              aria-controls="palette-list"
            >
            <kbd class="hidden rounded-md border border-line px-1.5 py-0.5 text-xs text-muted sm:block">Esc</kbd>
          </div>
          <ul id="palette-list" class="max-h-[50vh] overflow-y-auto p-2" role="listbox">
            <li v-for="(item, i) in items" :key="item.to + item.label" role="option" :aria-selected="i === active">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                :class="i === active ? 'bg-accent-soft text-accent-dark' : 'text-ink hover:bg-surface'"
                @mouseenter="active = i"
                @click="go(item)"
              >
                <span class="truncate font-medium">{{ item.label }}</span>
                <span class="shrink-0 text-xs font-medium uppercase tracking-wider text-muted">{{ item.group }}</span>
              </button>
            </li>
            <li v-if="!items.length" class="px-3 py-6 text-center text-muted">No results for “{{ query }}”.</li>
          </ul>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
