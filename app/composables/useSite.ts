import { defaultSettings, type SiteSettings } from '#shared/schemas/settings'

type PublicSite = Pick<SiteSettings, 'general' | 'profile' | 'contact' | 'socials' | 'seo'> & { subscribersEnabled: boolean }

/** Site-wide settings (name, socials, contact, SEO defaults) managed from the admin. */
export function useSite() {
  const { data } = useFetch<PublicSite>('/api/site', { key: 'site' })
  return computed<PublicSite>(() => data.value ?? { ...defaultSettings, subscribersEnabled: true })
}
