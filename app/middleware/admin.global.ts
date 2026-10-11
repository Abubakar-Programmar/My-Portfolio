// UX guard for the admin area. The real protection is the server-side guard on /api/admin/*.
const OPEN_ROUTES = ['/admin/login', '/admin/forgot-password']

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return
  const { loggedIn, fetch, ready } = useUserSession()
  if (!ready.value) await fetch()

  if (OPEN_ROUTES.includes(to.path)) {
    if (loggedIn.value && to.path === '/admin/login') return navigateTo('/admin')
    return
  }
  if (!loggedIn.value) return navigateTo('/admin/login')
})
