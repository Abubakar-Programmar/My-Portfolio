interface ToastOptions {
  message: string
  variant?: 'success' | 'error'
  duration?: number
}

interface Toast extends Required<Omit<ToastOptions, 'duration'>> {
  id: number
}

const toasts = reactive<Toast[]>([])
let nextId = 0

export function useToast() {
  function show(options: ToastOptions) {
    const id = nextId++
    toasts.push({ id, message: options.message, variant: options.variant ?? 'success' })

    const duration = options.duration ?? 4000
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id: number) {
    const index = toasts.findIndex(toast => toast.id === id)
    if (index !== -1) toasts.splice(index, 1)
  }

  function success(message: string) {
    show({ message, variant: 'success' })
  }

  function error(message: string) {
    show({ message, variant: 'error' })
  }

  return { toasts, show, dismiss, success, error }
}
