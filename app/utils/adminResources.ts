import type { ZodType } from 'zod'
import {
  blogCategoryInput, certificationInput, educationInput, experienceInput, postInput, projectInput,
  serviceCategoryInput, serviceInput, skillInput, tagInput, testimonialInput
} from '#shared/schemas/content'

export type OptionsSource = 'service-categories' | 'blog-categories' | 'services'

export type Field =
  | { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'datetime' | 'url'; placeholder?: string; hint?: string; rows?: number; half?: boolean }
  | { key: string; label: string; type: 'richtext'; hint?: string }
  | { key: string; label: string; type: 'toggle'; hint?: string; half?: boolean }
  | { key: string; label: string; type: 'select'; options?: { value: string; label: string }[]; optionsFrom?: OptionsSource; emptyLabel?: string; hint?: string; half?: boolean }
  | { key: string; label: string; type: 'image'; hint?: string }
  | { key: string; label: string; type: 'pdf'; hint?: string }
  | { key: string; label: string; type: 'images'; hint?: string }
  | { key: string; label: string; type: 'strings' | 'chips'; placeholder?: string; hint?: string }
  | { key: string; label: string; type: 'objects'; fields: Field[]; itemLabel: string; hint?: string }

export interface Section { title: string; description?: string; fields: Field[] }

export interface Column {
  key: string
  label: string
  kind?: 'text' | 'status' | 'date' | 'bool' | 'image' | 'number' | 'strong'
  class?: string
}

export interface ResourceConfig {
  /** URL segment: /admin/<path> */
  path: string
  /** Key used by /api/admin/<apiKey> */
  apiKey: string
  singular: string
  plural: string
  description: string
  nameField: string
  columns: Column[]
  statusFilter?: boolean
  sections: Section[]
  defaults: () => Record<string, unknown>
  schema: ZodType
  publicUrl?: (row: Record<string, unknown>) => string | null
  duplicable?: boolean
}

const seo: Section = {
  title: 'Search appearance',
  description: 'Overrides for search results and social sharing. Leave empty to use the title and summary.',
  fields: [
    { key: 'seoTitle', label: 'SEO title', type: 'text', hint: 'Up to 70 characters.' },
    { key: 'seoDescription', label: 'SEO description', type: 'textarea', rows: 3, hint: 'Up to 170 characters.' }
  ]
}

const publishStatus = [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]

export const resourceConfigs: ResourceConfig[] = [
  {
    path: 'services', apiKey: 'services', singular: 'Service', plural: 'Services', nameField: 'title', duplicable: true, statusFilter: true,
    description: 'The digital services you offer, shown on the Services pages.',
    schema: serviceInput,
    publicUrl: r => `/services/${r.slug}`,
    columns: [
      { key: 'coverImage', label: '', kind: 'image' },
      { key: 'title', label: 'Title', kind: 'strong' },
      { key: 'status', label: 'Status', kind: 'status' },
      { key: 'featured', label: 'Featured', kind: 'bool' },
      { key: 'sortOrder', label: 'Order', kind: 'number' },
      { key: 'updatedAt', label: 'Updated', kind: 'date' }
    ],
    defaults: () => ({ title: '', slug: '', summary: '', overview: '', icon: 'code', coverImage: null, images: [], deliverables: [], processSteps: [], tools: [], showPricing: false, startingPrice: '', packages: [], turnaround: '', faqs: [], seoTitle: '', seoDescription: '', status: 'draft', featured: false, sortOrder: 0, categoryId: null }),
    sections: [
      { title: 'Basics', fields: [
        { key: 'title', label: 'Title', type: 'text', half: true },
        { key: 'slug', label: 'URL slug', type: 'text', half: true, hint: 'Leave empty to generate from the title.' },
        { key: 'summary', label: 'Short summary', type: 'textarea', rows: 3, hint: 'Shown on cards and as the intro. Up to 400 characters.' },
        { key: 'categoryId', label: 'Category', type: 'select', optionsFrom: 'service-categories', emptyLabel: 'No category', half: true },
        { key: 'icon', label: 'Icon', type: 'select', half: true, options: ['code', 'search', 'cart', 'bolt', 'pen', 'shield', 'globe', 'layers', 'sparkles', 'trending', 'database', 'users'].map(v => ({ value: v, label: v })) },
        { key: 'status', label: 'Status', type: 'select', options: publishStatus, half: true },
        { key: 'sortOrder', label: 'Sort order', type: 'number', half: true, hint: 'Lower numbers appear first.' },
        { key: 'featured', label: 'Featured on the home page', type: 'toggle' }
      ] },
      { title: 'Overview', fields: [{ key: 'overview', label: 'Overview', type: 'richtext' }] },
      { title: 'Images', fields: [
        { key: 'coverImage', label: 'Cover image', type: 'image' },
        { key: 'images', label: 'Gallery', type: 'images', hint: 'Drag to reorder.' }
      ] },
      { title: 'Details', fields: [
        { key: 'deliverables', label: 'Deliverables', type: 'strings', placeholder: 'e.g. Responsive design for all devices' },
        { key: 'processSteps', label: 'Process steps', type: 'objects', itemLabel: 'Step', fields: [
          { key: 'title', label: 'Step title', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea', rows: 2 }
        ] },
        { key: 'tools', label: 'Tools & technologies', type: 'chips', placeholder: 'Type a tool and press Enter' },
        { key: 'turnaround', label: 'Turnaround time', type: 'text', placeholder: 'e.g. 3–6 weeks' }
      ] },
      { title: 'Pricing', description: 'Prices are only shown publicly when the toggle is on.', fields: [
        { key: 'showPricing', label: 'Show pricing on the website', type: 'toggle' },
        { key: 'startingPrice', label: 'Starting from', type: 'text', placeholder: 'e.g. From $1,800' },
        { key: 'packages', label: 'Packages', type: 'objects', itemLabel: 'Package', fields: [
          { key: 'name', label: 'Name', type: 'text', half: true }, { key: 'price', label: 'Price', type: 'text', half: true },
          { key: 'description', label: 'Description', type: 'text' }, { key: 'features', label: 'Features', type: 'strings' }
        ] }
      ] },
      { title: 'FAQs', fields: [
        { key: 'faqs', label: 'Questions', type: 'objects', itemLabel: 'FAQ', fields: [
          { key: 'question', label: 'Question', type: 'text' }, { key: 'answer', label: 'Answer', type: 'textarea', rows: 3 }
        ] }
      ] },
      seo
    ]
  },
  {
    path: 'projects', apiKey: 'projects', singular: 'Project', plural: 'Projects', nameField: 'title', duplicable: true, statusFilter: true,
    description: 'Case studies shown on the Projects pages.',
    schema: projectInput,
    publicUrl: r => `/projects/${r.slug}`,
    columns: [
      { key: 'coverImage', label: '', kind: 'image' }, { key: 'title', label: 'Title', kind: 'strong' }, { key: 'client', label: 'Client' },
      { key: 'status', label: 'Status', kind: 'status' }, { key: 'featured', label: 'Featured', kind: 'bool' }, { key: 'updatedAt', label: 'Updated', kind: 'date' }
    ],
    defaults: () => ({ title: '', slug: '', summary: '', client: '', year: new Date().getFullYear(), problem: '', solution: '', results: [], techStack: [], coverImage: null, gallery: [], liveUrl: '', githubUrl: '', serviceId: null, seoTitle: '', seoDescription: '', status: 'draft', featured: false, sortOrder: 0 }),
    sections: [
      { title: 'Basics', fields: [
        { key: 'title', label: 'Title', type: 'text', half: true }, { key: 'slug', label: 'URL slug', type: 'text', half: true, hint: 'Leave empty to generate from the title.' },
        { key: 'summary', label: 'Short summary', type: 'textarea', rows: 3 },
        { key: 'client', label: 'Client', type: 'text', half: true }, { key: 'year', label: 'Year', type: 'number', half: true },
        { key: 'serviceId', label: 'Related service', type: 'select', optionsFrom: 'services', emptyLabel: 'None', half: true },
        { key: 'status', label: 'Status', type: 'select', options: publishStatus, half: true },
        { key: 'sortOrder', label: 'Sort order', type: 'number', half: true }, { key: 'featured', label: 'Featured on the home page', type: 'toggle', half: true }
      ] },
      { title: 'Story', fields: [
        { key: 'problem', label: 'The problem', type: 'richtext' }, { key: 'solution', label: 'The solution', type: 'richtext' },
        { key: 'results', label: 'Results (before / after)', type: 'objects', itemLabel: 'Metric', fields: [
          { key: 'label', label: 'Metric', type: 'text' }, { key: 'before', label: 'Before', type: 'text', half: true }, { key: 'after', label: 'After', type: 'text', half: true }
        ] }
      ] },
      { title: 'Images & links', fields: [
        { key: 'coverImage', label: 'Cover image', type: 'image' }, { key: 'gallery', label: 'Screenshots', type: 'images', hint: 'Drag to reorder.' },
        { key: 'techStack', label: 'Tech stack', type: 'chips', placeholder: 'Type a technology and press Enter' },
        { key: 'liveUrl', label: 'Live URL', type: 'url', half: true }, { key: 'githubUrl', label: 'GitHub URL', type: 'url', half: true }
      ] },
      seo
    ]
  },
  {
    path: 'blog', apiKey: 'posts', singular: 'Post', plural: 'Blog posts', nameField: 'title', duplicable: true, statusFilter: true,
    description: 'Articles. Drafts are private; scheduled posts go live automatically at their publish date.',
    schema: postInput,
    publicUrl: r => `/blog/${r.slug}`,
    columns: [
      { key: 'coverImage', label: '', kind: 'image' }, { key: 'title', label: 'Title', kind: 'strong' },
      { key: 'status', label: 'Status', kind: 'status' }, { key: 'publishedAt', label: 'Publish date', kind: 'date' }, { key: 'readingMinutes', label: 'Read (min)', kind: 'number' }
    ],
    defaults: () => ({ title: '', slug: '', excerpt: '', content: '', coverImage: null, status: 'draft', publishedAt: null, featured: false, categoryId: null, tags: [], seoTitle: '', seoDescription: '' }),
    sections: [
      { title: 'Basics', fields: [
        { key: 'title', label: 'Title', type: 'text', half: true }, { key: 'slug', label: 'URL slug', type: 'text', half: true, hint: 'Leave empty to generate from the title.' },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 3, hint: 'Shown on cards and in feeds.' },
        { key: 'categoryId', label: 'Category', type: 'select', optionsFrom: 'blog-categories', emptyLabel: 'Uncategorised', half: true },
        { key: 'tags', label: 'Tags', type: 'chips', placeholder: 'Type a tag and press Enter' },
        { key: 'status', label: 'Status', type: 'select', half: true, options: [{ value: 'draft', label: 'Draft' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'published', label: 'Published' }] },
        { key: 'publishedAt', label: 'Publish date', type: 'datetime', half: true, hint: 'Required for scheduled posts.' },
        { key: 'featured', label: 'Featured', type: 'toggle' }
      ] },
      { title: 'Cover image', fields: [{ key: 'coverImage', label: 'Cover image', type: 'image' }] },
      { title: 'Content', fields: [{ key: 'content', label: 'Article', type: 'richtext' }] },
      seo
    ]
  },
  {
    path: 'testimonials', apiKey: 'testimonials', singular: 'Testimonial', plural: 'Testimonials', nameField: 'name', statusFilter: true,
    description: 'Client quotes shown on the home page and Testimonials page.',
    schema: testimonialInput,
    columns: [{ key: 'name', label: 'Name', kind: 'strong' }, { key: 'company', label: 'Company' }, { key: 'rating', label: 'Rating', kind: 'number' }, { key: 'status', label: 'Status', kind: 'status' }, { key: 'featured', label: 'On home', kind: 'bool' }],
    defaults: () => ({ name: '', role: '', company: '', quote: '', avatar: null, rating: 5, featured: true, status: 'published', sortOrder: 0 }),
    sections: [{ title: 'Testimonial', fields: [
      { key: 'name', label: 'Name', type: 'text', half: true }, { key: 'role', label: 'Role', type: 'text', half: true }, { key: 'company', label: 'Company', type: 'text', half: true },
      { key: 'rating', label: 'Rating (1–5)', type: 'number', half: true }, { key: 'quote', label: 'Quote', type: 'textarea', rows: 5 },
      { key: 'avatar', label: 'Photo (optional)', type: 'image' },
      { key: 'status', label: 'Status', type: 'select', options: publishStatus, half: true }, { key: 'sortOrder', label: 'Sort order', type: 'number', half: true },
      { key: 'featured', label: 'Show on the home page', type: 'toggle' }
    ] }]
  },
  {
    path: 'skills', apiKey: 'skills', singular: 'Skill', plural: 'Skills', nameField: 'name',
    description: 'Grouped by category on the About page; names also scroll in the home page strip.',
    schema: skillInput,
    columns: [{ key: 'name', label: 'Skill', kind: 'strong' }, { key: 'category', label: 'Category' }, { key: 'level', label: 'Level %', kind: 'number' }, { key: 'sortOrder', label: 'Order', kind: 'number' }],
    defaults: () => ({ name: '', category: '', level: 80, sortOrder: 0 }),
    sections: [{ title: 'Skill', fields: [
      { key: 'name', label: 'Name', type: 'text', half: true }, { key: 'category', label: 'Category', type: 'text', half: true, hint: 'e.g. Frontend, Backend, SEO, Tools' },
      { key: 'level', label: 'Level (0–100)', type: 'number', half: true }, { key: 'sortOrder', label: 'Sort order', type: 'number', half: true }
    ] }]
  },
  {
    path: 'experience', apiKey: 'experience', singular: 'Experience', plural: 'Experience', nameField: 'role',
    description: 'Work history timeline on the About page.',
    schema: experienceInput,
    columns: [{ key: 'role', label: 'Role', kind: 'strong' }, { key: 'company', label: 'Company' }, { key: 'startDate', label: 'From' }, { key: 'endDate', label: 'To' }],
    defaults: () => ({ role: '', company: '', location: '', startDate: '', endDate: '', description: '', sortOrder: 0 }),
    sections: [{ title: 'Position', fields: [
      { key: 'role', label: 'Role', type: 'text', half: true }, { key: 'company', label: 'Company', type: 'text', half: true },
      { key: 'location', label: 'Location', type: 'text', half: true }, { key: 'sortOrder', label: 'Sort order', type: 'number', half: true },
      { key: 'startDate', label: 'Start', type: 'text', half: true, placeholder: 'e.g. 2022' }, { key: 'endDate', label: 'End', type: 'text', half: true, hint: 'Leave empty for “Present”.' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 4 }
    ] }]
  },
  {
    path: 'education', apiKey: 'education', singular: 'Education', plural: 'Education', nameField: 'degree',
    description: 'Education entries on the About page.',
    schema: educationInput,
    columns: [{ key: 'degree', label: 'Degree', kind: 'strong' }, { key: 'institution', label: 'Institution' }, { key: 'startDate', label: 'From' }, { key: 'endDate', label: 'To' }],
    defaults: () => ({ degree: '', institution: '', startDate: '', endDate: '', description: '', sortOrder: 0 }),
    sections: [{ title: 'Education', fields: [
      { key: 'degree', label: 'Degree / course', type: 'text', half: true }, { key: 'institution', label: 'Institution', type: 'text', half: true },
      { key: 'startDate', label: 'Start', type: 'text', half: true }, { key: 'endDate', label: 'End', type: 'text', half: true },
      { key: 'sortOrder', label: 'Sort order', type: 'number', half: true }, { key: 'description', label: 'Description', type: 'textarea', rows: 3 }
    ] }]
  },
  {
    path: 'certifications', apiKey: 'certifications', singular: 'Certification', plural: 'Certifications', nameField: 'name',
    description: 'Certifications listed on the About page.',
    schema: certificationInput,
    columns: [{ key: 'name', label: 'Name', kind: 'strong' }, { key: 'issuer', label: 'Issuer' }, { key: 'year', label: 'Year', kind: 'number' }],
    defaults: () => ({ name: '', issuer: '', year: new Date().getFullYear(), url: '', sortOrder: 0 }),
    sections: [{ title: 'Certification', fields: [
      { key: 'name', label: 'Name', type: 'text', half: true }, { key: 'issuer', label: 'Issuer', type: 'text', half: true },
      { key: 'year', label: 'Year', type: 'number', half: true }, { key: 'sortOrder', label: 'Sort order', type: 'number', half: true }, { key: 'url', label: 'Credential URL', type: 'url' }
    ] }]
  },
  {
    path: 'service-categories', apiKey: 'service-categories', singular: 'Service category', plural: 'Service categories', nameField: 'name',
    description: 'Used to filter the Services page.', schema: serviceCategoryInput,
    columns: [{ key: 'name', label: 'Name', kind: 'strong' }, { key: 'slug', label: 'Slug' }, { key: 'sortOrder', label: 'Order', kind: 'number' }],
    defaults: () => ({ name: '', slug: '', sortOrder: 0 }),
    sections: [{ title: 'Category', fields: [{ key: 'name', label: 'Name', type: 'text', half: true }, { key: 'slug', label: 'URL slug', type: 'text', half: true }, { key: 'sortOrder', label: 'Sort order', type: 'number', half: true }] }]
  },
  {
    path: 'blog-categories', apiKey: 'blog-categories', singular: 'Blog category', plural: 'Blog categories', nameField: 'name',
    description: 'Used to group and filter blog posts.', schema: blogCategoryInput,
    columns: [{ key: 'name', label: 'Name', kind: 'strong' }, { key: 'slug', label: 'Slug' }, { key: 'description', label: 'Description' }],
    defaults: () => ({ name: '', slug: '', description: '' }),
    sections: [{ title: 'Category', fields: [{ key: 'name', label: 'Name', type: 'text', half: true }, { key: 'slug', label: 'URL slug', type: 'text', half: true }, { key: 'description', label: 'Description', type: 'textarea', rows: 3 }] }]
  },
  {
    path: 'tags', apiKey: 'tags', singular: 'Tag', plural: 'Tags', nameField: 'name',
    description: 'Blog tags. New tags are also created automatically when you add them to a post.', schema: tagInput,
    columns: [{ key: 'name', label: 'Name', kind: 'strong' }, { key: 'slug', label: 'Slug' }],
    defaults: () => ({ name: '', slug: '' }),
    sections: [{ title: 'Tag', fields: [{ key: 'name', label: 'Name', type: 'text', half: true }, { key: 'slug', label: 'URL slug', type: 'text', half: true }] }]
  }
]

export function findResource(path: string): ResourceConfig | undefined {
  return resourceConfigs.find(r => r.path === path)
}
