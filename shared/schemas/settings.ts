import { z } from 'zod'

const optUrl = z
  .string()
  .trim()
  .max(500)
  .default('')
  .refine(v => !v || /^(https?:\/\/|\/)/i.test(v), 'Must be a full URL starting with https:// or a /path')

export const generalSettings = z.object({
  siteTitle: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(160),
  siteDescription: z.string().trim().max(300),
  logo: z.string().trim().max(500).default(''),
  favicon: z.string().trim().max(500).default(''),
  maintenance: z.boolean(),
  maintenanceMessage: z.string().trim().max(300)
})

export const profileSettings = z.object({
  name: z.string().trim().min(1).max(80),
  role: z.string().trim().max(120),
  pitch: z.string().trim().max(400),
  shortBio: z.string().trim().max(400),
  bio: z.string().trim().max(10000),
  photo: z.string().trim().max(500).default(''),
  resume: z.string().trim().max(500).default(''),
  availability: z.boolean(),
  availabilityText: z.string().trim().max(120),
  yearsExperience: z.coerce.number().int().min(0).max(80),
  projectsCompleted: z.coerce.number().int().min(0).max(10000),
  happyClients: z.coerce.number().int().min(0).max(10000),
  ctaTitle: z.string().trim().max(160),
  ctaText: z.string().trim().max(300)
})

export const contactSettings = z.object({
  email: z.string().trim().max(200).pipe(z.email().or(z.literal(''))),
  phone: z.string().trim().max(40).default(''),
  whatsapp: z.string().trim().max(30).regex(/^\d*$/, 'Digits only, with country code').default(''),
  location: z.string().trim().max(120).default(''),
  bookingUrl: optUrl
})

export const socialsSettings = z.object({
  items: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        url: z.string().trim().max(500).regex(/^https?:\/\//i, 'Must start with https://')
      })
    )
    .max(12)
})

export const seoSettings = z.object({
  titleTemplate: z.string().trim().max(80),
  ogImage: z.string().trim().max(500).default(''),
  twitterHandle: z.string().trim().max(40).default(''),
  keywords: z.string().trim().max(300).default('')
})

export const notificationSettings = z.object({
  email: z.string().trim().max(200).pipe(z.email().or(z.literal(''))),
  onMessage: z.boolean(),
  onLoginAlert: z.boolean(),
  onSubscriber: z.boolean(),
  onSystemError: z.boolean(),
  weeklySummary: z.boolean(),
  autoReply: z.boolean(),
  autoReplyMessage: z.string().trim().max(2000),
  subscribersEnabled: z.boolean()
})

export const settingSchemas = {
  general: generalSettings,
  profile: profileSettings,
  contact: contactSettings,
  socials: socialsSettings,
  seo: seoSettings,
  notifications: notificationSettings
} as const

export type SettingGroup = keyof typeof settingSchemas
export type GeneralSettings = z.infer<typeof generalSettings>
export type ProfileSettings = z.infer<typeof profileSettings>
export type ContactSettings = z.infer<typeof contactSettings>
export type SocialsSettings = z.infer<typeof socialsSettings>
export type SeoSettings = z.infer<typeof seoSettings>
export type NotificationSettings = z.infer<typeof notificationSettings>

export interface SiteSettings {
  general: GeneralSettings
  profile: ProfileSettings
  contact: ContactSettings
  socials: SocialsSettings
  seo: SeoSettings
  notifications: NotificationSettings
}

export const defaultSettings: SiteSettings = {
  general: {
    siteTitle: 'Abubakar Developer',
    tagline: 'Full-stack developer & SEO specialist',
    siteDescription:
      'I build fast, search-friendly websites and web apps, and help businesses grow organic traffic with technical SEO.',
    logo: '',
    favicon: '',
    maintenance: false,
    maintenanceMessage: 'The site is getting a quick update. Please check back shortly.'
  },
  profile: {
    name: 'Abubakar Developer',
    role: 'Full-Stack Developer & SEO Specialist',
    pitch:
      'I design, build and optimise websites that load fast, rank well and turn visitors into customers.',
    shortBio:
      'Full-stack developer and technical SEO specialist helping teams ship fast websites that get found.',
    bio: '',
    photo: '',
    resume: '',
    availability: true,
    availabilityText: 'Available for new projects',
    yearsExperience: 3,
    projectsCompleted: 15,
    happyClients: 10,
    ctaTitle: 'Have a project in mind?',
    ctaText: 'Tell me about your goals and I will reply within five working hours with next steps.'
  },
  contact: { email: 'abubakarkhanzzz321321@gmail.com', phone: '+92 315 9761378', whatsapp: '923159761378', location: '', bookingUrl: '' },
  socials: { items: [] },
  seo: {
    titleTemplate: '%s | Abubakar Developer',
    ogImage: '/og-default.png',
    twitterHandle: '',
    keywords: 'web developer, technical SEO, Nuxt, Vue, freelance developer'
  },
  notifications: {
    email: 'abubakarkhanzzz321321@gmail.com',
    onMessage: true,
    onLoginAlert: true,
    onSubscriber: true,
    onSystemError: true,
    weeklySummary: true,
    autoReply: true,
    autoReplyMessage:
      'Thank you for reaching out. We have received your request and will respond within the next five working hours.',
    subscribersEnabled: true
  }
}
