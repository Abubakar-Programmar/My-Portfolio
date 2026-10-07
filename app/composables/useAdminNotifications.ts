export interface AdminNotification {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  readAt: string | null
  createdAt: string
}

/**
 * Live notifications for the admin bell. Uses Server-Sent Events and falls back to short
 * polling if the stream cannot be kept open.
 */
export function useAdminNotifications() {
  const items = useState<AdminNotification[]>('admin-notifications', () => [])
  const unread = useState('admin-notifications-unread', () => 0)
  const inboxUnread = useState('admin-inbox-unread', () => 0)
  const connected = useState('admin-notifications-connected', () => false)
  const toast = useToast()

  async function refresh() {
    const [list, inbox] = await Promise.all([
      $fetch<{ items: AdminNotification[]; unread: number }>('/api/admin/notifications'),
      $fetch<{ counts: { unread: number } }>('/api/admin/messages', { query: { view: 'all', pageSize: 1 } })
    ])
    items.value = list.items
    unread.value = list.unread
    inboxUnread.value = inbox.counts.unread
  }

  async function markRead(id?: string) {
    await $fetch('/api/admin/notifications/read', { method: 'POST', body: { id } })
    const now = new Date().toISOString()
    items.value = items.value.map(n => (!id || n.id === id ? { ...n, readAt: n.readAt ?? now } : n))
    unread.value = items.value.filter(n => !n.readAt).length
  }

  let source: EventSource | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null

  function startPolling() {
    if (pollTimer) return
    pollTimer = setInterval(() => refresh().catch(() => {}), 30_000)
  }

  function connect() {
    if (!import.meta.client || source) return
    refresh().catch(() => {})
    try {
      source = new EventSource('/api/admin/notifications/stream')
      source.addEventListener('open', () => {
        connected.value = true
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
      })
      source.addEventListener('notification', (e) => {
        const n = JSON.parse((e as MessageEvent<string>).data) as Omit<AdminNotification, 'readAt'>
        items.value = [{ ...n, readAt: null }, ...items.value].slice(0, 30)
        unread.value++
        if (n.type === 'message') inboxUnread.value++
        toast.success(n.title)
      })
      source.addEventListener('error', () => {
        connected.value = false
        startPolling()
      })
    } catch {
      startPolling()
    }
  }

  function disconnect() {
    source?.close()
    source = null
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
  }

  return { items, unread, inboxUnread, connected, refresh, markRead, connect, disconnect }
}
