import { EventEmitter } from 'node:events'

export interface LiveNotification {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  createdAt: string
}

// In-process pub/sub that feeds the Server-Sent Events stream in the admin panel.
const globalKey = '__portfolio_notification_bus__'
const g = globalThis as unknown as Record<string, EventEmitter | undefined>
const emitter = (g[globalKey] ??= new EventEmitter().setMaxListeners(50))

export function publishNotification(payload: LiveNotification) {
  emitter.emit('notification', payload)
}

export function subscribeNotifications(handler: (payload: LiveNotification) => void) {
  emitter.on('notification', handler)
  return () => emitter.off('notification', handler)
}
