<script setup lang="ts">
// Dependency-free area/line chart. Labels live in HTML so text never distorts when the SVG scales.
const props = defineProps<{ series: { day: string; value: number }[]; label: string }>()

const W = 600
const H = 180
const PAD = 8
const hover = ref<number | null>(null)

const max = computed(() => Math.max(1, ...props.series.map(p => p.value)))
const total = computed(() => props.series.reduce((s, p) => s + p.value, 0))
const points = computed(() =>
  props.series.map((p, i) => ({
    x: PAD + (i / Math.max(1, props.series.length - 1)) * (W - PAD * 2),
    y: H - PAD - (p.value / max.value) * (H - PAD * 2)
  }))
)
const line = computed(() => points.value.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '))
const area = computed(() => (points.value.length ? `${line.value} L${points.value.at(-1)!.x},${H} L${points.value[0]!.x},${H} Z` : ''))

function onMove(e: PointerEvent) {
  const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  hover.value = Math.min(props.series.length - 1, Math.max(0, Math.round(ratio * (props.series.length - 1))))
}
const active = computed(() => (hover.value === null ? null : { point: points.value[hover.value]!, data: props.series[hover.value]! }))
</script>

<template>
  <figure :aria-label="`${label}: ${total} in the last ${series.length} days`">
    <div class="relative">
      <svg :viewBox="`0 0 ${W} ${H}`" class="h-44 w-full touch-none" preserveAspectRatio="none" role="img" :aria-label="`${label} over time`" @pointermove="onMove" @pointerleave="hover = null">
        <defs>
          <linearGradient :id="`grad-${label}`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B3DF5" stop-opacity=".22" /><stop offset="1" stop-color="#5B3DF5" stop-opacity="0" /></linearGradient>
        </defs>
        <line v-for="g in 3" :key="g" x1="0" :x2="W" :y1="(H / 4) * g" :y2="(H / 4) * g" stroke="#E7E8EE" stroke-width="1" vector-effect="non-scaling-stroke" />
        <path :d="area" :fill="`url(#grad-${label})`" />
        <path :d="line" fill="none" stroke="#5B3DF5" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
        <line v-if="active" :x1="active.point.x" :x2="active.point.x" y1="0" :y2="H" stroke="#A78BFA" stroke-width="1" stroke-dasharray="3 3" vector-effect="non-scaling-stroke" />
      </svg>
      <div v-if="active" class="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white shadow-lift" :style="{ left: `${(active.point.x / W) * 100}%` }">
        <span class="font-bold">{{ active.data.value }}</span> · {{ formatDate(active.data.day, { month: 'short', day: 'numeric' }) }}
      </div>
    </div>
    <figcaption class="mt-2 flex justify-between text-xs text-muted">
      <span>{{ formatDate(series[0]?.day, { month: 'short', day: 'numeric' }) }}</span>
      <span>Peak {{ max }}</span>
      <span>{{ formatDate(series.at(-1)?.day, { month: 'short', day: 'numeric' }) }}</span>
    </figcaption>
  </figure>
</template>
