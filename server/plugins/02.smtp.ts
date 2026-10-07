// Logs whether the SMTP connection works on startup (never prints credentials).
export default defineNitroPlugin(() => {
  void verifySmtp().then((result) => {
    if (result.ok) console.log('[mail] SMTP connection verified')
    else console.warn(`[mail] SMTP verification failed: ${result.error}`)
  })
})
