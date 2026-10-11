// Every /api/admin route requires a valid, non-revoked admin session, except the
// sign-in / password-reset entry points. Client-side route guards are only UX.
const PUBLIC_ADMIN_ROUTES = new Set([
  '/api/admin/login',
  '/api/admin/forgot-password',
  '/api/admin/verify-otp',
  '/api/admin/reset-password'
])

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0] ?? ''
  if (!path.startsWith('/api/admin/') || PUBLIC_ADMIN_ROUTES.has(path)) return
  await requireAdmin(event)
})
