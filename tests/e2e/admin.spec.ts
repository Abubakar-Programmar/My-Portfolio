import { expect, test } from '@playwright/test'
import { adminEmail, login, open } from './helpers'

test.describe('admin authentication', () => {
  test('rejects wrong credentials and protects the API', async ({ page, request }) => {
    expect((await request.get('/api/admin/dashboard')).status()).toBe(401)
    await open(page, '/admin/login')
    await page.getByLabel('Email').fill(adminEmail)
    await page.getByLabel('Password').fill('definitely-not-the-password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toContainText('Invalid email or password')
  })

  test('redirects anonymous visitors to the login page and signs in', async ({ page }) => {
    await open(page, '/admin/services')
    await expect(page).toHaveURL(/\/admin\/login$/)
    await login(page)
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible()
  })
})

test('admin can create, edit and delete a testimonial', async ({ page }) => {
  await login(page)
  const name = `E2E Client ${Date.now()}`

  await open(page, '/admin/testimonials/new')
  await page.getByLabel('Name', { exact: true }).fill(name)
  await page.getByLabel('Quote').fill('Outstanding work from start to finish, highly recommended.')
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page.getByText('Testimonial saved')).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/testimonials\/[0-9a-f-]{36}$/)

  // The edit form only exists once the saved record has loaded.
  await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible()
  await page.getByLabel('Company').fill('E2E Corp')
  const saved = page.waitForResponse(r => r.request().method() === 'PUT' && r.ok())
  await page.getByRole('button', { name: 'Save changes' }).click()
  await saved

  await open(page, '/admin/testimonials')
  await page.getByLabel('Search Testimonials').fill(name)
  await expect(page.getByRole('link', { name, exact: true })).toBeVisible()
  await expect(page.getByRole('row', { name: new RegExp(name) })).toContainText('E2E Corp')

  await page.getByRole('button', { name: `Delete ${name}` }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText('Testimonial deleted')).toBeVisible()
  await expect(page.getByRole('link', { name, exact: true })).toHaveCount(0)
})
