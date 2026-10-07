<script setup lang="ts">
interface Testimonial { id: string; name: string; role: string | null; company: string | null; quote: string; avatar: string | null; rating: number }
const props = defineProps<{ items: Testimonial[] }>()

const track = ref<HTMLElement | null>(null)
const paused = ref(false)
const reduced = ref(true)

function step(dir: 1 | -1) {
  const el = track.value
  if (!el) return
  const card = el.firstElementChild as HTMLElement | null
  const amount = (card?.offsetWidth ?? 320) + 24
  const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
  if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
  else el.scrollBy({ left: dir * amount, behavior: 'smooth' })
}

onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
const { pause, resume } = useIntervalFn(() => { if (!paused.value && !reduced.value && props.items.length > 1) step(1) }, 6500)
watch(paused, v => (v ? pause() : resume()))
</script>

<template>
  <div @mouseenter="paused = true" @mouseleave="paused = false" @focusin="paused = true" @focusout="paused = false">
    <div ref="track" class="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden" tabindex="0" role="region" aria-label="Client testimonials" aria-roledescription="carousel">
      <figure
        v-for="t in items"
        :key="t.id"
        class="card flex min-w-[88%] snap-start flex-col justify-between p-7 shadow-soft sm:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)]"
      >
        <div>
          <div class="flex gap-0.5 text-amber-500" :aria-label="`${t.rating} out of 5 stars`" role="img">
            <AppIcon v-for="n in t.rating" :key="n" name="star-filled" :size="18" />
          </div>
          <blockquote class="mt-4 text-lg leading-relaxed text-ink">“{{ t.quote }}”</blockquote>
        </div>
        <figcaption class="mt-6 flex items-center gap-3">
          <AppImage v-if="t.avatar" :src="t.avatar" :alt="t.name" :width="44" :height="44" class="h-11 w-11 rounded-full object-cover" />
          <span v-else class="grid h-11 w-11 place-items-center rounded-full bg-accent-soft font-bold text-accent-dark" aria-hidden="true">{{ initials(t.name) }}</span>
          <div>
            <div class="font-semibold text-ink">{{ t.name }}</div>
            <div class="text-sm text-muted">{{ [t.role, t.company].filter(Boolean).join(', ') }}</div>
          </div>
        </figcaption>
      </figure>
    </div>
    <div v-if="items.length > 1" class="mt-4 flex justify-end gap-2">
      <button type="button" class="btn btn-secondary btn-icon" aria-label="Previous testimonial" @click="step(-1)"><AppIcon name="arrow-left" /></button>
      <button type="button" class="btn btn-secondary btn-icon" aria-label="Next testimonial" @click="step(1)"><AppIcon name="arrow-right" /></button>
    </div>
  </div>
</template>
