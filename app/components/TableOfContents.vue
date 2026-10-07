<script setup lang="ts">
const props = defineProps<{ items: { id: string; text: string; level: 2 | 3 }[] }>()
const active = ref('')

onMounted(() => {
  const headings = props.items.map(i => document.getElementById(i.id)).filter((el): el is HTMLElement => Boolean(el))
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible) active.value = visible.target.id
    },
    { rootMargin: '-90px 0px -65% 0px' }
  )
  headings.forEach(h => observer.observe(h))
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <nav v-if="items.length" aria-label="Table of contents" class="rounded-2xl border border-line bg-paper p-5">
    <h2 class="text-sm font-semibold uppercase tracking-wider text-ink">On this page</h2>
    <ul class="mt-3 space-y-1.5 text-sm">
      <li v-for="item in items" :key="item.id" :class="item.level === 3 ? 'pl-4' : ''">
        <a :href="`#${item.id}`" class="block rounded-md py-1 transition-colors" :class="active === item.id ? 'font-semibold text-accent' : 'text-muted hover:text-ink'">{{ item.text }}</a>
      </li>
    </ul>
  </nav>
</template>
