import 'dotenv/config'
import { defineConfig } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3100'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL,
    // Set PW_CHANNEL=msedge (or chrome) to use an installed browser instead of the bundled Chromium.
    channel: process.env.PW_CHANNEL || undefined,
    trace: 'retain-on-failure'
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm exec nuxt dev --port 3100',
        url: `${baseURL}/api/health`,
        reuseExistingServer: true,
        timeout: 180_000,
        env: { APP_URL: baseURL }
      }
})
