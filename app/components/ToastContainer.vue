<script setup lang="ts">
const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col gap-3 max-sm:left-4" aria-live="polite">
      <TransitionGroup name="toast">
        <button
          v-for="toast in toasts"
          :key="toast.id"
          type="button"
          class="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-line border-l-4 bg-white px-4 py-3.5 text-left text-sm font-medium text-ink shadow-lift sm:max-w-sm"
          :class="toast.variant === 'error' ? 'border-l-danger' : 'border-l-success'"
          :role="toast.variant === 'error' ? 'alert' : 'status'"
          @click="dismiss(toast.id)"
        >
          <AppIcon :name="toast.variant === 'error' ? 'alert' : 'check-circle'" :class="toast.variant === 'error' ? 'text-danger' : 'text-success'" :size="20" />
          <span>{{ toast.message }}</span>
        </button>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateY(12px); }
.toast-leave-to { opacity: 0; transform: translateX(24px); }
</style>
