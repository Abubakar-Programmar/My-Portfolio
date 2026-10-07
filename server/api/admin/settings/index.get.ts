export default defineEventHandler(async () => {
  const settings = await getSettings()
  return { ...settings, notificationEmailFallback: await notificationRecipient() }
})
