<script setup lang="ts">
const { state, handleConfirm, handleCancel } = useConfirm()
useEventListener('keydown', (e: KeyboardEvent) => {
  if (state.isOpen && e.key === 'Escape') handleCancel()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="state.isOpen" class="fixed inset-0 z-[110] flex items-center justify-center bg-ink/50 p-5 backdrop-blur-sm" @click.self="handleCancel">
        <div class="w-full max-w-md rounded-2xl bg-white p-7 shadow-lift" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" :aria-describedby="state.message ? 'confirm-message' : undefined">
          <h2 id="confirm-title" class="text-xl font-bold text-ink">{{ state.title }}</h2>
          <p v-if="state.message" id="confirm-message" class="mt-2 text-muted">{{ state.message }}</p>
          <div class="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" class="btn btn-secondary" @click="handleCancel">{{ state.cancelLabel }}</button>
            <button type="button" class="btn" :class="state.danger ? 'btn-danger' : 'btn-primary'" @click="handleConfirm">{{ state.confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
