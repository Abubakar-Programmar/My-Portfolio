interface ConfirmOptions {
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmState extends Required<ConfirmOptions> {
  isOpen: boolean
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmState>({
  isOpen: false,
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false,
  resolve: null
})

export function useConfirm() {
  function confirm(options: ConfirmOptions = {}): Promise<boolean> {
    state.title = options.title ?? 'Are you sure?'
    state.message = options.message ?? ''
    state.confirmLabel = options.confirmLabel ?? 'Confirm'
    state.cancelLabel = options.cancelLabel ?? 'Cancel'
    state.danger = options.danger ?? false
    state.isOpen = true

    return new Promise<boolean>((resolve) => {
      state.resolve = resolve
    })
  }

  function handleConfirm() {
    state.isOpen = false
    state.resolve?.(true)
    state.resolve = null
  }

  function handleCancel() {
    state.isOpen = false
    state.resolve?.(false)
    state.resolve = null
  }

  return { state, confirm, handleConfirm, handleCancel }
}
