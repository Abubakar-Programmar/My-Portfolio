import { eq } from 'drizzle-orm'
import { setting } from '../database/schema'
import {
  defaultSettings,
  settingSchemas,
  type SettingGroup,
  type SiteSettings
} from '../../shared/schemas/settings'

const TTL_MS = 15_000
let cache: { at: number; value: SiteSettings } | null = null

/** All site settings, with defaults filled in for anything not yet saved. Cached briefly. */
export async function getSettings(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value
  const rows = await useDb().select().from(setting)
  const merged = structuredClone(defaultSettings) as unknown as Record<string, Record<string, unknown>>
  for (const row of rows) {
    if (row.key in merged) merged[row.key] = { ...merged[row.key], ...row.value }
  }
  const value = merged as unknown as SiteSettings
  cache = { at: Date.now(), value }
  return value
}

export async function saveSettings<G extends SettingGroup>(group: G, value: SiteSettings[G]) {
  await useDb()
    .insert(setting)
    .values({ key: group, value: value as Record<string, unknown> })
    .onConflictDoUpdate({ target: setting.key, set: { value: value as Record<string, unknown>, updatedAt: new Date() } })
  cache = null
}

export function isSettingGroup(key: string): key is SettingGroup {
  return key in settingSchemas
}

export async function getSettingRow(key: string) {
  const [row] = await useDb().select().from(setting).where(eq(setting.key, key))
  return row
}

/** Address that receives owner notifications: settings, then NOTIFY_EMAIL, then ADMIN_EMAIL. */
export async function notificationRecipient(): Promise<string> {
  const config = useRuntimeConfig()
  const settings = await getSettings()
  return settings.notifications.email || config.notifyEmail || config.adminEmail
}
