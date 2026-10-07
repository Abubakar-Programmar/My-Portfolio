// Server-Sent Events: pushes new notifications to the admin dashboard in real time.
export default defineEventHandler(async (event) => {
  const stream = createEventStream(event)
  const unsubscribe = subscribeNotifications((payload) => {
    void stream.push({ event: 'notification', data: JSON.stringify(payload) })
  })
  const heartbeat = setInterval(() => void stream.push({ event: 'ping', data: 'ok' }), 25_000)
  stream.onClosed(() => {
    clearInterval(heartbeat)
    unsubscribe()
  })
  return stream.send()
})
