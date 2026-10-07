// Public site-wide settings. Notification preferences are deliberately excluded.
export default defineEventHandler(async () => {
  const { general, profile, contact, socials, seo, notifications } = await getSettings()
  return {
    general,
    profile,
    contact,
    socials,
    seo,
    subscribersEnabled: notifications.subscribersEnabled
  }
})
