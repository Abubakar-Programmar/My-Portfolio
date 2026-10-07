import { expect, type Page } from '@playwright/test'

export const adminEmail = process.env.ADMIN_EMAIL ?? ''
export const adminPassword = process.env.ADMIN_PASSWORD ?? ''

/** Navigates and waits until Vue has hydrated, so clicks are handled by the app. */
export async function open(page: Page, path: string) {
  await page.goto(path)
  await page.locator('html[data-hydrated="true"]').waitFor({ state: 'attached' })
}

export async function login(page: Page) {
  await open(page, '/admin/login')
  await page.getByLabel('Email').fill(adminEmail)
  await page.getByLabel('Password').fill(adminPassword)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin$/)
}
