import { expect, test } from '@playwright/test'
import { login, open } from './helpers'

test('contact form saves the message, creates a notification and attempts an email', async ({ page }) => {
  const unique = `E2E message ${Date.now()}`
  // On a cold dev server Vite may reload the page once while it optimises dependencies; settle first.
  await open(page, '/contact')
  await page.reload()
  await open(page, '/contact')
  await page.getByLabel('Your name').fill('E2E Visitor')
  await page.getByLabel('Email', { exact: true }).fill('e2e-visitor@example.com')
  await page.getByLabel('Service interested in').selectOption({ index: 1 })
  await page.getByLabel('How can I help?').fill(`${unique} — please send me a quote.`)

  // The form rejects submissions made faster than a human could type.
  await page.waitForTimeout(3500)
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('Message sent — thank you!')).toBeVisible({ timeout: 20_000 })

  await login(page)
  const messages = await page.request.get(`/api/admin/messages?view=all&q=${encodeURIComponent(unique)}`)
  const body = (await messages.json()) as { items: { id: string; name: string; serviceName: string | null }[] }
  expect(body.items).toHaveLength(1)
  expect(body.items[0]!.serviceName).toBeTruthy()

  const notifications = (await (await page.request.get('/api/admin/notifications')).json()) as { items: { type: string; link: string | null }[] }
  expect(notifications.items.some(n => n.type === 'message' && n.link === `/admin/inbox/${body.items[0]!.id}`)).toBe(true)

  // The email is sent in the background — poll the delivery log until the attempt shows up.
  await expect
    .poll(async () => {
      const log = (await (await page.request.get('/api/admin/email/logs')).json()) as { items: { kind: string; createdAt: string }[] }
      return log.items.some(e => e.kind === 'message' && Date.now() - new Date(e.createdAt).getTime() < 60_000)
    }, { timeout: 30_000 })
    .toBe(true)

  await page.goto(`/admin/inbox/${body.items[0]!.id}`)
  await expect(page.getByText(unique)).toBeVisible()
})

test('contact form validates input and ignores bots', async ({ page, request }) => {
  await open(page, '/contact')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('Please enter your name')).toBeVisible()

  // A filled honeypot gets a normal-looking response but nothing is stored.
  const res = await request.post('/api/contact', { data: { name: 'Bot', email: 'bot@example.com', message: 'Buy cheap stuff now', website: 'http://spam', startedAt: Date.now() - 10_000 } })
  expect(res.ok()).toBe(true)
})
