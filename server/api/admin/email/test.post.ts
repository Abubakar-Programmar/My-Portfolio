export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const to = await notificationRecipient()
  if (!to) throw apiError(400, 'Set a notification email address first.')
  const settings = await getSettings()
  const result = await sendMail({ to, kind: 'test', ...testEmail(settings.general.siteTitle) })
  await logActivity(user.email, 'update', 'Email', null, `Sent a test email (${result.ok ? 'delivered' : 'failed'})`)
  if (!result.ok) throw apiError(502, `Test email failed: ${result.error}`)
  return { ok: true, to }
})
