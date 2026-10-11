// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = process.env.APP_URL || 'http://localhost:3000'
// Strict limits in production; relaxed in dev so repeated manual/e2e runs are not throttled.
const limit = (strict: number) => (process.env.NODE_ENV === 'production' ? strict : strict * 100)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devServer: { port: Number(new URL(siteUrl).port) || 3000 },
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxtjs/seo',
    '@vueuse/nuxt',
    '@vueuse/motion/nuxt',
    'nuxt-auth-utils',
    'nuxt-security',
    '@nuxt/eslint'
  ],
  css: ['~/assets/css/main.css'],

  site: {
    url: siteUrl,
    name: 'Abubakar Developer',
    defaultLocale: 'en'
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'Blog RSS feed', href: '/rss.xml' }
      ],
      meta: [{ name: 'theme-color', content: '#F7F3E8' }]
    }
  },

  fonts: {
    families: [
      { name: 'Bricolage Grotesque', provider: 'google', weights: [500, 600, 700, 800] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] }
    ]
  },

  image: {
    quality: 80,
    format: ['webp'],
    providers: {
      media: { provider: '~/providers/media.ts' }
    }
  },

  seo: { redirectToCanonicalSiteUrl: false, validateAppHead: false },
  tailwindcss: { viewer: false },
  ogImage: { enabled: false },
  linkChecker: { enabled: false },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    exclude: ['/admin/**', '/api/**']
  },
  robots: {
    disallow: ['/admin']
  },

  security: {
    nonce: true,
    strict: false,
    headers: {
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: 'same-site',
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'base-uri': ["'self'"],
        'font-src': ["'self'", 'data:'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'frame-src': ["'none'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'media-src': ["'self'"],
        'object-src': ["'none'"],
        'script-src-attr': ["'none'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'script-src': ["'self'", "'nonce-{{nonce}}'", "'strict-dynamic'"],
        'connect-src': ["'self'"],
        'upgrade-insecure-requests': process.env.NODE_ENV === 'production'
      },
      strictTransportSecurity: { maxAge: 31536000, includeSubdomains: true, preload: false },
      xFrameOptions: 'DENY',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: { camera: [], microphone: [], geolocation: [], payment: [] }
    },
    rateLimiter: { tokensPerInterval: 300, interval: 60_000, headers: true },
    requestSizeLimiter: { maxRequestSizeInBytes: 12_000_000, maxUploadFileRequestInBytes: 12_000_000 },
    corsHandler: false,
    csrf: false
  },

  routeRules: {
    '/': { swr: 10 },
    '/about': { swr: 10 },
    '/services/**': { swr: 10 },
    '/projects/**': { swr: 10 },
    '/blog/**': { swr: 10 },
    '/admin/**': { robots: false, ssr: false },
    '/api/**': { headers: { 'x-robots-tag': 'noindex, nofollow' } },
    '/api/contact': { security: { rateLimiter: { tokensPerInterval: limit(5), interval: 600_000 } } },
    '/api/subscribe': { security: { rateLimiter: { tokensPerInterval: limit(5), interval: 600_000 } } },
    '/api/admin/login': { security: { rateLimiter: { tokensPerInterval: limit(10), interval: 600_000 } } },
    '/api/admin/forgot-password': { security: { rateLimiter: { tokensPerInterval: limit(5), interval: 900_000 } } },
    '/api/admin/verify-otp': { security: { rateLimiter: { tokensPerInterval: limit(15), interval: 900_000 } } },
    '/api/admin/reset-password': { security: { rateLimiter: { tokensPerInterval: limit(10), interval: 900_000 } } },
    '/media/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' }, security: { rateLimiter: false } }
  },

  nitro: {
    experimental: { tasks: true },
    scheduledTasks: { '0 8 * * 1': ['summary:weekly'] },
    compressPublicAssets: true
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL ?? '',
    mail: {
      host: process.env.MAIL_HOST ?? '',
      port: process.env.MAIL_PORT ?? '587',
      username: process.env.MAIL_USERNAME ?? '',
      password: process.env.MAIL_PASSWORD ?? '',
      encryption: process.env.MAIL_ENCRYPTION ?? 'tls',
      fromAddress: process.env.MAIL_FROM_ADDRESS ?? '',
      fromName: process.env.MAIL_FROM_NAME ?? 'Portfolio'
    },
    adminEmail: process.env.ADMIN_EMAIL ?? '',
    notifyEmail: process.env.NOTIFY_EMAIL ?? '',
    uploadsDir: process.env.UPLOADS_DIR ?? './uploads',
    public: { siteUrl }
  },

  typescript: { strict: true },
  telemetry: false
})
