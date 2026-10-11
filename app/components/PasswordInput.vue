<script setup lang="ts">
// Password field with a show / hide toggle. Drop-in for <input type="password"> with v-model.
// `class` / `style` land on the wrapper; every other attribute (id, autocomplete, …) on the <input>.
defineOptions({ inheritAttrs: false })
const model = defineModel<string>({ default: '' })
withDefaults(defineProps<{ invalid?: boolean }>(), { invalid: false })

const attrs = useAttrs()
const inputAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const visible = ref(false)
</script>

<template>
  <div class="relative" :class="attrs.class" :style="attrs.style as string">
    <input
      v-bind="inputAttrs"
      v-model="model"
      :type="visible ? 'text' : 'password'"
      class="input pr-12"
      :class="{ 'input-error': invalid }"
      :aria-invalid="invalid || undefined"
    >
    <button
      type="button"
      class="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-accent/10 hover:text-accent"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <AppIcon :name="visible ? 'eye-off' : 'eye'" :size="19" />
    </button>
  </div>
</template>
