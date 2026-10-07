interface PageSeo {
  title: string
  description?: string | null
  image?: string | null
  type?: 'website' | 'article'
  noindex?: boolean
  breadcrumbs?: { name: string; path: string }[]
  /** Extra schema.org nodes (Service, Article, …). */
  schema?: Record<string, unknown>[]
  publishedAt?: string | null
}

/** Per-page meta, Open Graph / Twitter cards, canonical URL (via @nuxtjs/seo) and JSON-LD. */
export function usePageSeo(page: PageSeo | (() => PageSeo)) {
  const site = useSite()
  const resolve = () => (typeof page === 'function' ? page() : page)

  useSeoMeta({
    title: () => resolve().title,
    description: () => resolve().description || site.value.general.siteDescription,
    ogTitle: () => resolve().title,
    ogDescription: () => resolve().description || site.value.general.siteDescription,
    ogType: () => resolve().type ?? 'website',
    ogImage: () => absoluteUrl(resolve().image || site.value.seo.ogImage),
    twitterCard: 'summary_large_image',
    twitterImage: () => absoluteUrl(resolve().image || site.value.seo.ogImage),
    twitterSite: () => site.value.seo.twitterHandle || undefined,
    articlePublishedTime: () => resolve().publishedAt || undefined,
    robots: () => (resolve().noindex ? 'noindex, nofollow' : undefined)
  })

  const crumbs = resolve().breadcrumbs
  const nodes: Record<string, unknown>[] = [...(resolve().schema ?? [])]
  if (crumbs?.length) {
    nodes.push(
      defineBreadcrumb({
        itemListElement: [{ name: 'Home', item: absoluteUrl('/') }, ...crumbs.map(c => ({ name: c.name, item: absoluteUrl(c.path) }))]
      }) as Record<string, unknown>
    )
  }
  if (nodes.length) useSchemaOrg(nodes)
}
