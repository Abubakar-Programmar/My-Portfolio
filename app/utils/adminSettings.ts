import type { SettingGroup } from '#shared/schemas/settings'
import type { Section } from './adminResources'

export interface SettingsPanel { group: SettingGroup; title: string; description: string; sections: Section[] }

export const settingsPanels: Record<SettingGroup, SettingsPanel> = {
  general: {
    group: 'general', title: 'General', description: 'Name, branding and maintenance mode.',
    sections: [{ title: 'Site', fields: [
      { key: 'siteTitle', label: 'Site title', type: 'text', half: true }, { key: 'tagline', label: 'Tagline', type: 'text', half: true },
      { key: 'siteDescription', label: 'Default description', type: 'textarea', rows: 3, hint: 'Used for search results and sharing when a page has no description of its own.' },
      { key: 'logo', label: 'Logo', type: 'image', hint: 'Optional. A monogram is shown if empty.' },
      { key: 'favicon', label: 'Favicon', type: 'image', hint: 'Optional. Square image, at least 64×64.' }
    ] }, { title: 'Maintenance mode', description: 'Visitors see a “back soon” page (HTTP 503). The admin stays available.', fields: [
      { key: 'maintenance', label: 'Enable maintenance mode', type: 'toggle' },
      { key: 'maintenanceMessage', label: 'Message', type: 'text' }
    ] }]
  },
  profile: {
    group: 'profile', title: 'Profile', description: 'Your story, photo and the numbers shown on the home page.',
    sections: [
      { title: 'Introduction', fields: [
        { key: 'name', label: 'Full name', type: 'text', half: true }, { key: 'role', label: 'Role / title', type: 'text', half: true },
        { key: 'pitch', label: 'Hero pitch', type: 'textarea', rows: 3 }, { key: 'shortBio', label: 'Short bio', type: 'textarea', rows: 2, hint: 'Footer, blog author box and search descriptions.' },
        { key: 'bio', label: 'About page story', type: 'textarea', rows: 10, hint: 'Separate paragraphs with a blank line.' },
        { key: 'photo', label: 'Photo', type: 'image' }, { key: 'resume', label: 'Resume (PDF)', type: 'pdf' }
      ] },
      { title: 'Availability', fields: [
        { key: 'availability', label: 'Available for work', type: 'toggle' }, { key: 'availabilityText', label: 'Badge text', type: 'text', placeholder: 'Available for new projects' }
      ] },
      { title: 'Counters', description: 'Animated stats on the home page.', fields: [
        { key: 'yearsExperience', label: 'Years of experience', type: 'number', half: true }, { key: 'projectsCompleted', label: 'Projects delivered', type: 'number', half: true },
        { key: 'happyClients', label: 'Happy clients', type: 'number', half: true }
      ] },
      { title: 'Call to action', fields: [{ key: 'ctaTitle', label: 'Heading', type: 'text' }, { key: 'ctaText', label: 'Text', type: 'textarea', rows: 2 }] }
    ]
  },
  contact: {
    group: 'contact', title: 'Contact', description: 'Public contact details and your booking link.',
    sections: [{ title: 'Contact details', fields: [
      { key: 'email', label: 'Public email', type: 'text', half: true }, { key: 'phone', label: 'Phone', type: 'text', half: true },
      { key: 'whatsapp', label: 'WhatsApp number', type: 'text', half: true, hint: 'Digits only with country code, e.g. 15551234567.' }, { key: 'location', label: 'Location', type: 'text', half: true },
      { key: 'bookingUrl', label: 'Booking link', type: 'url', hint: 'Optional — e.g. a Cal.com or Calendly link.' }
    ] }]
  },
  socials: {
    group: 'socials', title: 'Social links', description: 'Shown in the footer and contact page. The icon is chosen from the label (GitHub, LinkedIn, X…).',
    sections: [{ title: 'Profiles', fields: [{ key: 'items', label: 'Links', type: 'objects', itemLabel: 'Link', fields: [
      { key: 'label', label: 'Label', type: 'text', half: true, placeholder: 'GitHub' }, { key: 'url', label: 'URL', type: 'url', half: true, placeholder: 'https://github.com/you' }
    ] }] }]
  },
  seo: {
    group: 'seo', title: 'SEO defaults', description: 'Fallbacks for pages without their own SEO fields.',
    sections: [{ title: 'Defaults', fields: [
      { key: 'titleTemplate', label: 'Title template', type: 'text', hint: 'Informational — page titles are suffixed with the site title automatically.' },
      { key: 'ogImage', label: 'Default social image', type: 'image', hint: 'Use a PNG or JPG around 1200×630 — social networks do not render SVG.' },
      { key: 'twitterHandle', label: 'X / Twitter handle', type: 'text', placeholder: '@yourname', half: true }, { key: 'keywords', label: 'Keywords', type: 'text', half: true }
    ] }]
  },
  notifications: {
    group: 'notifications', title: 'Notifications', description: 'Dashboard notifications are always stored; choose which events also send you an email.',
    sections: [
      { title: 'Where to send', fields: [{ key: 'email', label: 'Personal notification email', type: 'text', hint: 'Defaults to the ADMIN_EMAIL from your environment when empty.' }] },
      { title: 'Email me when…', fields: [
        { key: 'onMessage', label: 'A new contact message or quote request arrives', type: 'toggle' },
        { key: 'onLoginAlert', label: 'Failed-login spike or sign-in from a new device', type: 'toggle' },
        { key: 'onSubscriber', label: 'Someone subscribes to the blog', type: 'toggle' },
        { key: 'onSystemError', label: 'An important system error occurs', type: 'toggle' },
        { key: 'weeklySummary', label: 'Weekly summary (Mondays, 08:00 server time)', type: 'toggle' }
      ] },
      { title: 'Visitors', fields: [
        { key: 'autoReply', label: 'Send an automatic reply to visitors after they contact me', type: 'toggle' },
        { key: 'autoReplyMessage', label: 'Auto-reply message', type: 'textarea', rows: 4 },
        { key: 'subscribersEnabled', label: 'Enable blog subscriptions', type: 'toggle' }
      ] }
    ]
  }
}
