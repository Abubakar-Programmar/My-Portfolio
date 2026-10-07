// Sample content for a first run. Everything here is editable from the admin panel.
// Companies, clients and testimonials below are fictional placeholders — replace them with real ones.
import type { FaqItem, PricingPackage, ProcessStep, ResultMetric } from './schema'

export const serviceCategories = [
  { name: 'Development', slug: 'development', sortOrder: 1 },
  { name: 'SEO & Growth', slug: 'seo-growth', sortOrder: 2 },
  { name: 'Support', slug: 'support', sortOrder: 3 }
]

interface SeedService {
  slug: string
  title: string
  summary: string
  overview: string
  icon: string
  category: string
  cover: string
  images: string[]
  deliverables: string[]
  processSteps: ProcessStep[]
  tools: string[]
  showPricing: boolean
  startingPrice: string | null
  packages: PricingPackage[]
  turnaround: string
  faqs: FaqItem[]
  featured: boolean
  seoTitle: string
  seoDescription: string
}

export const services: SeedService[] = [
  {
    slug: 'web-development',
    title: 'Web Development',
    summary: 'Fast, accessible websites and web apps built with Nuxt, Vue and TypeScript — designed to rank and convert.',
    overview:
      '<p>Your website is your busiest salesperson. I build sites that load in under two seconds, work flawlessly on every device and are structured so search engines understand them from day one.</p><h2>What you get</h2><p>A production-ready site built on a modern stack (Nuxt, Vue 3, TypeScript, PostgreSQL) with a clean admin area so you can edit content without calling a developer. Performance, accessibility and technical SEO are part of the build, not an afterthought.</p><h2>Who it is for</h2><p>Founders, agencies and small teams who need a reliable, maintainable website or a custom web app — and want one person accountable from first sketch to launch.</p>',
    icon: 'code',
    category: 'development',
    cover: '/seed/web-development.svg',
    images: ['/seed/web-development.svg', '/seed/web-development-2.svg'],
    deliverables: [
      'Responsive design for mobile, tablet and desktop',
      'Component-based build in Nuxt 4 and TypeScript',
      'Content admin so you can update pages yourself',
      'Technical SEO setup: meta, sitemap, structured data',
      'Lighthouse 90+ performance and accessibility targets',
      'Analytics and contact form wired up',
      'Launch checklist, handover video and 30 days of support'
    ],
    processSteps: [
      { title: 'Discovery call', description: 'We align on goals, audience, content and budget. You get a written scope and a fixed quote.' },
      { title: 'Design & structure', description: 'Page structure, wireframes and a visual direction you approve before any code is written.' },
      { title: 'Build', description: 'Iterative development with a live staging link, so you see progress every week.' },
      { title: 'Test & optimise', description: 'Cross-device testing, accessibility checks and performance tuning against Core Web Vitals.' },
      { title: 'Launch & handover', description: 'Deployment, redirects and monitoring, plus training so you are confident running the site.' }
    ],
    tools: ['Nuxt', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Drizzle ORM', 'Figma'],
    showPricing: true,
    startingPrice: 'From $1,800',
    packages: [
      { name: 'Starter', price: '$1,800', description: 'A focused brochure site for a new business.', features: ['Up to 5 pages', 'Responsive design', 'Contact form', 'Basic SEO setup'] },
      { name: 'Business', price: '$4,500', description: 'A complete website with a content admin.', features: ['Up to 12 pages', 'Blog and admin panel', 'Advanced SEO and schema', 'Analytics dashboard'] },
      { name: 'Custom app', price: 'Quote', description: 'Web apps, portals and integrations.', features: ['Custom features', 'Authentication', 'Database design', 'API integrations'] }
    ],
    turnaround: '3–6 weeks',
    faqs: [
      { question: 'Do I own the website and code?', answer: 'Yes. When the final invoice is paid, the code, design files and content are fully yours.' },
      { question: 'Can I edit the content myself?', answer: 'Yes. Every site includes an admin area for pages, blog posts, images and settings, with a walkthrough video.' },
      { question: 'Will the site be good for SEO?', answer: 'Technical SEO is built in: semantic markup, fast loading, sitemap, structured data and clean URLs.' },
      { question: 'Do you offer hosting?', answer: 'I deploy to the host you prefer and document everything. I can recommend reliable, affordable options.' }
    ],
    featured: true,
    seoTitle: 'Web Development Services — Nuxt, Vue & TypeScript',
    seoDescription: 'Custom, fast and SEO-friendly websites and web apps built with Nuxt, Vue and TypeScript. Fixed quotes, clear process, 30 days of support.'
  },
  {
    slug: 'technical-seo-audit',
    title: 'Technical SEO Audit & Strategy',
    summary: 'A deep technical audit and a prioritised roadmap that removes the barriers between your site and page one.',
    overview:
      '<p>Great content cannot rank if search engines struggle to crawl, render or understand your site. A technical SEO audit finds exactly what is holding you back and turns it into an ordered to-do list.</p><h2>How the audit works</h2><p>I crawl your site, review index coverage and Core Web Vitals, inspect structured data and internal linking, and compare you against the pages that currently outrank you. Every finding includes the evidence, the impact and the fix.</p><h2>What changes after</h2><p>You leave with a clear plan your team (or I) can implement in weeks — ranked by impact and effort, so quick wins come first.</p>',
    icon: 'search',
    category: 'seo-growth',
    cover: '/seed/seo-audit.svg',
    images: ['/seed/seo-audit.svg', '/seed/seo-audit-2.svg'],
    deliverables: [
      'Full crawl and indexation analysis',
      'Core Web Vitals and page-speed review',
      'Structured data and schema validation',
      'Internal linking and site architecture review',
      'Competitor gap analysis',
      'Prioritised action plan with effort and impact scores',
      'Walkthrough call and written report'
    ],
    processSteps: [
      { title: 'Access & goals', description: 'Search Console and analytics access, plus the business goals the SEO work needs to support.' },
      { title: 'Crawl & analyse', description: 'Full technical crawl, log and index review, performance measurement and competitor benchmarking.' },
      { title: 'Prioritise', description: 'Findings are scored by impact and effort so the highest-return fixes come first.' },
      { title: 'Report & walkthrough', description: 'A clear written report and a call to walk through every recommendation.' }
    ],
    tools: ['Search Console', 'Screaming Frog', 'Lighthouse', 'PageSpeed Insights', 'Ahrefs', 'Schema validators'],
    showPricing: true,
    startingPrice: 'From $650',
    packages: [
      { name: 'Audit', price: '$650', description: 'One-off audit and roadmap for sites up to 500 pages.', features: ['Technical crawl', 'Core Web Vitals review', 'Action plan', 'Walkthrough call'] },
      { name: 'Audit + fixes', price: '$1,900', description: 'The audit, plus implementation of the top fixes.', features: ['Everything in Audit', 'Up to 20 hours of fixes', 'Before/after reporting'] }
    ],
    turnaround: '5–7 business days',
    faqs: [
      { question: 'What do you need from me?', answer: 'Read access to Google Search Console and your analytics, plus a short call about your goals and competitors.' },
      { question: 'Will you implement the fixes?', answer: 'Yes, if you want. Many clients take the report to their own developers; others add implementation hours.' },
      { question: 'How soon will I see results?', answer: 'Technical fixes are usually picked up within weeks, but rankings can take two to four months to reflect them fully.' }
    ],
    featured: true,
    seoTitle: 'Technical SEO Audit & Strategy for Growing Websites',
    seoDescription: 'A thorough technical SEO audit with a prioritised roadmap: crawlability, Core Web Vitals, structured data and internal linking.'
  },
  {
    slug: 'ecommerce-development',
    title: 'E-commerce Development',
    summary: 'Storefronts that load instantly, rank for product searches and make checkout effortless.',
    overview:
      '<p>Online stores live and die by speed and findability. I build fast, SEO-ready storefronts — headless or on a platform you already use — with product pages structured to earn rich results in search.</p><h2>Built to sell</h2><p>Clean category architecture, schema markup for products and reviews, optimised images and a frictionless checkout flow that keeps mobile shoppers moving.</p>',
    icon: 'cart',
    category: 'development',
    cover: '/seed/ecommerce.svg',
    images: ['/seed/ecommerce.svg', '/seed/ecommerce-2.svg'],
    deliverables: [
      'Storefront design and build (headless or platform-based)',
      'Product and category page templates optimised for search',
      'Product, review and breadcrumb structured data',
      'Image optimisation and lazy loading',
      'Payment and shipping integrations',
      'Conversion-focused checkout flow',
      'Analytics and conversion tracking'
    ],
    processSteps: [
      { title: 'Catalogue audit', description: 'Review products, categories and URL structure to plan an architecture that ranks.' },
      { title: 'Design', description: 'Mobile-first templates for home, category, product and checkout pages.' },
      { title: 'Build & integrate', description: 'Storefront build with your payment, shipping and inventory tools connected.' },
      { title: 'Launch', description: 'Redirect mapping, QA on real orders and post-launch monitoring.' }
    ],
    tools: ['Nuxt', 'Shopify Storefront API', 'Stripe', 'PostgreSQL', 'Cloudinary'],
    showPricing: false,
    startingPrice: null,
    packages: [],
    turnaround: '6–10 weeks',
    faqs: [
      { question: 'Do you work with Shopify?', answer: 'Yes. I build custom Shopify themes and headless storefronts, and also custom stores on your own stack.' },
      { question: 'Can you migrate my existing store?', answer: 'Yes, including 301 redirects and product data so rankings are protected.' }
    ],
    featured: true,
    seoTitle: 'E-commerce Development — Fast, SEO-Ready Online Stores',
    seoDescription: 'Custom e-commerce storefronts built for speed, search visibility and conversion, with structured data and clean architecture.'
  },
  {
    slug: 'website-performance-optimization',
    title: 'Website Performance Optimization',
    summary: 'Pass Core Web Vitals and make your site feel instant — better rankings, lower bounce, more conversions.',
    overview:
      '<p>Slow pages cost rankings and revenue. I profile your site, find what is actually slowing it down and fix it — images, JavaScript, fonts, server response and layout shifts.</p><h2>Measured, not guessed</h2><p>Every change is validated with lab and field data, so you can see the before and after in the numbers that matter: LCP, INP and CLS.</p>',
    icon: 'bolt',
    category: 'seo-growth',
    cover: '/seed/performance.svg',
    images: ['/seed/performance.svg', '/seed/performance-2.svg'],
    deliverables: [
      'Core Web Vitals baseline and target report',
      'Image, font and script optimisation',
      'Render-blocking resource and caching fixes',
      'Layout shift and interaction latency fixes',
      'Before/after performance report'
    ],
    processSteps: [
      { title: 'Baseline', description: 'Measure lab and real-user performance on your key templates.' },
      { title: 'Diagnose', description: 'Trace the slowest requests, heaviest bundles and layout shifts to their source.' },
      { title: 'Fix', description: 'Apply and test optimisations in order of impact.' },
      { title: 'Verify', description: 'Re-measure and report the improvements with evidence.' }
    ],
    tools: ['Lighthouse', 'WebPageTest', 'Chrome DevTools', 'Nuxt', 'Vite'],
    showPricing: true,
    startingPrice: 'From $900',
    packages: [
      { name: 'Speed sprint', price: '$900', description: 'Up to 10 hours of focused optimisation.', features: ['Baseline report', 'Top fixes implemented', 'Before/after report'] }
    ],
    turnaround: '1–2 weeks',
    faqs: [
      { question: 'Does it work on any platform?', answer: 'Yes. WordPress, Shopify, Nuxt, Next and custom builds all have common, fixable bottlenecks.' },
      { question: 'What score will I reach?', answer: 'Most sites reach 90+ on mobile Lighthouse after optimisation, but I optimise for real-user Core Web Vitals, not just the score.' }
    ],
    featured: false,
    seoTitle: 'Website Performance Optimization & Core Web Vitals',
    seoDescription: 'Make your website fast. Core Web Vitals, image and script optimisation with measurable before-and-after results.'
  },
  {
    slug: 'content-and-on-page-seo',
    title: 'Content & On-page SEO',
    summary: 'Keyword research, content planning and on-page optimisation that turns search demand into qualified leads.',
    overview:
      '<p>Rankings come from matching what people search for with pages that answer it better than anyone else. I research the topics your customers care about, plan content around them and optimise every page element.</p><h2>Not just keywords</h2><p>Search intent, internal linking, titles that earn clicks and content structure that wins featured snippets — all aligned to your business goals.</p>',
    icon: 'pen',
    category: 'seo-growth',
    cover: '/seed/content-seo.svg',
    images: ['/seed/content-seo.svg', '/seed/content-seo-2.svg'],
    deliverables: [
      'Keyword and search-intent research',
      'Content gap analysis and 3-month content plan',
      'On-page optimisation of priority pages',
      'Title, meta description and heading rewrites',
      'Internal linking plan',
      'Monthly performance report'
    ],
    processSteps: [
      { title: 'Research', description: 'Find the keywords, questions and topics with real demand and realistic ranking potential.' },
      { title: 'Plan', description: 'A prioritised content calendar tied to your services and funnel.' },
      { title: 'Optimise', description: 'Improve existing pages and brief new ones with clear structure and intent.' },
      { title: 'Measure', description: 'Track rankings, clicks and leads, then iterate monthly.' }
    ],
    tools: ['Search Console', 'Ahrefs', 'Google Analytics', 'Surfer', 'Notion'],
    showPricing: true,
    startingPrice: 'From $750 / month',
    packages: [
      { name: 'Growth', price: '$750 / mo', description: 'Ongoing on-page work and reporting.', features: ['4 optimised pages / month', 'Keyword tracking', 'Monthly report'] },
      { name: 'Scale', price: '$1,600 / mo', description: 'Content plan plus execution support.', features: ['8 optimised pages / month', 'Content briefs', 'Link building outreach plan'] }
    ],
    turnaround: 'First results in 6–12 weeks',
    faqs: [
      { question: 'Do you write the content?', answer: 'I provide detailed briefs and optimise copy. I can also work with your writers or recommend trusted ones.' },
      { question: 'Is there a minimum commitment?', answer: 'Three months is the minimum, because SEO needs time to compound.' }
    ],
    featured: true,
    seoTitle: 'Content & On-page SEO Services',
    seoDescription: 'Keyword research, content planning and on-page optimisation that turns organic search traffic into leads and customers.'
  },
  {
    slug: 'website-maintenance-and-support',
    title: 'Website Maintenance & Support',
    summary: 'Updates, security, backups and small improvements handled monthly, so your site stays fast and safe.',
    overview:
      '<p>A website is never finished. Dependencies age, content changes and small bugs pile up. A maintenance plan keeps everything updated and gives you a developer on call.</p><h2>Peace of mind</h2><p>Regular updates and backups, uptime monitoring, security patches and a monthly block of hours for improvements.</p>',
    icon: 'shield',
    category: 'support',
    cover: '/seed/maintenance.svg',
    images: ['/seed/maintenance.svg', '/seed/maintenance-2.svg'],
    deliverables: [
      'Dependency and security updates',
      'Daily backups with restore testing',
      'Uptime and error monitoring',
      'Monthly hours for fixes and improvements',
      'Monthly health report'
    ],
    processSteps: [
      { title: 'Onboarding', description: 'Access, documentation and a health check of your current setup.' },
      { title: 'Monitor', description: 'Automated uptime, error and performance monitoring.' },
      { title: 'Maintain', description: 'Scheduled updates, backups and improvements each month.' }
    ],
    tools: ['Uptime monitoring', 'GitHub Actions', 'Sentry', 'PostgreSQL', 'Linux'],
    showPricing: true,
    startingPrice: 'From $120 / month',
    packages: [
      { name: 'Essential', price: '$120 / mo', description: 'Keep it running and secure.', features: ['Updates & backups', 'Monitoring', '1 hour of changes'] },
      { name: 'Plus', price: '$320 / mo', description: 'Ongoing improvements included.', features: ['Everything in Essential', '4 hours of changes', 'Priority response'] }
    ],
    turnaround: 'Response within 1 business day',
    faqs: [
      { question: 'Do you maintain sites you did not build?', answer: 'Yes, after a short health check to understand what I am taking on.' },
      { question: 'Can I cancel any time?', answer: 'Yes, with 30 days notice and a full handover of any documentation.' }
    ],
    featured: false,
    seoTitle: 'Website Maintenance & Support Plans',
    seoDescription: 'Monthly website maintenance: updates, security, backups, monitoring and developer hours for improvements.'
  }
]

interface SeedProject {
  slug: string
  title: string
  summary: string
  client: string
  year: number
  problem: string
  solution: string
  results: ResultMetric[]
  techStack: string[]
  cover: string
  gallery: string[]
  liveUrl: string | null
  githubUrl: string | null
  service: string
  featured: boolean
}

export const projects: SeedProject[] = [
  {
    slug: 'northwind-outfitters-store',
    title: 'Northwind Outfitters — Headless Store Rebuild',
    summary: 'A slow template store rebuilt as a headless storefront that tripled mobile speed and lifted organic revenue by 64%.',
    client: 'Northwind Outfitters',
    year: 2025,
    problem:
      '<p>Northwind sold outdoor gear through a heavily customised theme. Pages took almost five seconds to become usable on mobile, category pages were thin, and organic traffic had been flat for a year while competitors climbed.</p>',
    solution:
      '<p>I rebuilt the storefront as a headless Nuxt front end on top of their existing commerce platform, so the team kept their admin workflow. Category pages got unique intros and faceted navigation that search engines could crawl, every product received Product and Review structured data, and images moved to responsive modern formats.</p><ul><li>Server-rendered pages with edge caching</li><li>Redesigned category and product templates</li><li>Complete 301 redirect map for 2,400 URLs</li></ul>',
    results: [
      { label: 'Mobile LCP', before: '4.8 s', after: '1.4 s' },
      { label: 'Conversion rate', before: '1.8%', after: '3.1%' },
      { label: 'Organic revenue', before: '$38k / mo', after: '$62k / mo' }
    ],
    techStack: ['Nuxt', 'TypeScript', 'Tailwind CSS', 'Stripe', 'PostgreSQL'],
    cover: '/seed/northwind.svg',
    gallery: ['/seed/northwind-2.svg', '/seed/northwind-3.svg'],
    liveUrl: null,
    githubUrl: null,
    service: 'ecommerce-development',
    featured: true
  },
  {
    slug: 'lumen-dental-local-seo',
    title: 'Lumen Dental — Website & Local SEO',
    summary: 'A new website and local SEO programme that grew organic traffic 5.6× and filled the appointment book.',
    client: 'Lumen Dental Clinic',
    year: 2025,
    problem:
      '<p>The clinic relied on word of mouth. Its old website had no service pages, no structured data and was missing from local map results for most treatments.</p>',
    solution:
      '<p>I designed a clear, accessible website with a dedicated page for every treatment, added LocalBusiness and FAQ structured data, and optimised the Google Business Profile. Booking was simplified to a single tap on mobile.</p><ul><li>Treatment pages written around real patient questions</li><li>Local schema, NAP consistency and review strategy</li><li>Online appointment request with email alerts</li></ul>',
    results: [
      { label: 'Organic visits / month', before: '1,200', after: '6,800' },
      { label: 'Map pack keywords in top 3', before: '4', after: '37' },
      { label: 'Online appointment requests', before: '6 / mo', after: '41 / mo' }
    ],
    techStack: ['Nuxt', 'Vue 3', 'Schema.org', 'Search Console', 'Tailwind CSS'],
    cover: '/seed/lumen.svg',
    gallery: ['/seed/lumen-2.svg', '/seed/lumen-3.svg'],
    liveUrl: null,
    githubUrl: null,
    service: 'content-and-on-page-seo',
    featured: true
  },
  {
    slug: 'atlas-freight-portal',
    title: 'Atlas Freight — Customer Tracking Portal',
    summary: 'A secure customer portal that replaced email back-and-forth with real-time shipment tracking.',
    client: 'Atlas Freight',
    year: 2024,
    problem:
      '<p>Atlas answered hundreds of “where is my shipment?” emails a week. Staff updated spreadsheets by hand and customers had no self-service view.</p>',
    solution:
      '<p>I built a web app where customers sign in to see live shipment status, documents and invoices. Staff update shipments from a dashboard and customers are notified automatically at each milestone.</p><ul><li>Role-based access for customers and staff</li><li>Status timeline and document uploads</li><li>Automatic email notifications</li></ul>',
    results: [
      { label: 'Status enquiries by email', before: '420 / week', after: '90 / week' },
      { label: 'Time to update a shipment', before: '6 min', after: '40 s' }
    ],
    techStack: ['Vue 3', 'Nuxt', 'PostgreSQL', 'Drizzle ORM', 'Nodemailer'],
    cover: '/seed/atlas.svg',
    gallery: ['/seed/atlas-2.svg', '/seed/atlas-3.svg'],
    liveUrl: null,
    githubUrl: null,
    service: 'web-development',
    featured: true
  },
  {
    slug: 'verde-kitchen-ordering',
    title: 'Verde Kitchen — Online Ordering Site',
    summary: 'A mobile-first menu and ordering experience that cut third-party delivery fees.',
    client: 'Verde Kitchen',
    year: 2024,
    problem:
      '<p>Verde depended on delivery marketplaces that took a large commission, and the restaurant’s own site was a PDF menu that was impossible to use on a phone.</p>',
    solution:
      '<p>I created a fast, image-led menu with direct ordering, simple modifiers and a pickup scheduler. Pages are fully server-rendered so the menu is indexed and loads instantly on slow connections.</p>',
    results: [
      { label: 'Direct orders', before: '12%', after: '38%' },
      { label: 'Mobile bounce rate', before: '71%', after: '34%' }
    ],
    techStack: ['Nuxt', 'Tailwind CSS', 'Stripe', 'PostgreSQL'],
    cover: '/seed/verde.svg',
    gallery: ['/seed/verde-2.svg', '/seed/verde-3.svg'],
    liveUrl: null,
    githubUrl: null,
    service: 'web-development',
    featured: false
  },
  {
    slug: 'pixel-and-pine-portfolio',
    title: 'Pixel & Pine — Studio Portfolio CMS',
    summary: 'A design studio’s portfolio with a custom admin, so designers publish case studies without developers.',
    client: 'Pixel & Pine Studio',
    year: 2024,
    problem:
      '<p>The studio’s static portfolio needed a developer for every new case study, so projects were published months after they shipped.</p>',
    solution:
      '<p>I built a content-managed portfolio with a rich-text editor, image library and scheduled publishing. Case studies render with art-directed layouts and are optimised for sharing.</p>',
    results: [
      { label: 'Time to publish a case study', before: '3 weeks', after: '1 day' },
      { label: 'Lighthouse performance', before: '58', after: '98' }
    ],
    techStack: ['Nuxt', 'Tiptap', 'PostgreSQL', 'sharp'],
    cover: '/seed/pixelpine.svg',
    gallery: ['/seed/pixelpine-2.svg', '/seed/pixelpine-3.svg'],
    liveUrl: null,
    githubUrl: null,
    service: 'web-development',
    featured: false
  },
  {
    slug: 'summit-legal-seo-migration',
    title: 'Summit Legal — SEO-safe Site Migration',
    summary: 'A full redesign and platform migration that grew organic traffic 142% instead of losing it.',
    client: 'Summit Legal',
    year: 2025,
    problem:
      '<p>Summit’s previous redesign had cost them 40% of organic traffic. They needed a new platform without repeating the mistake.</p>',
    solution:
      '<p>I mapped every ranking URL, preserved titles and internal links where they performed, and staged the launch with redirect testing and crawl comparisons. Post-launch monitoring caught and fixed issues within hours.</p><ul><li>1,800 URLs mapped and redirected</li><li>Pre-launch crawl diff and rollback plan</li><li>Daily rank and index monitoring for 60 days</li></ul>',
    results: [
      { label: 'Organic traffic', before: '9.4k / mo', after: '22.8k / mo' },
      { label: 'Indexed pages', before: '1,140', after: '1,790' },
      { label: 'Keywords in top 10', before: '212', after: '540' }
    ],
    techStack: ['Nuxt', 'Screaming Frog', 'Search Console', 'PostgreSQL'],
    cover: '/seed/summit.svg',
    gallery: ['/seed/summit-2.svg', '/seed/summit-3.svg'],
    liveUrl: null,
    githubUrl: null,
    service: 'technical-seo-audit',
    featured: true
  }
]

export const blogCategories = [
  { name: 'SEO', slug: 'seo', description: 'Technical and on-page SEO.' },
  { name: 'Web Development', slug: 'web-development', description: 'Building fast, maintainable websites.' },
  { name: 'Performance', slug: 'performance', description: 'Core Web Vitals and speed.' }
]

interface SeedPost {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  cover: string
  daysAgo: number
  featured: boolean
  content: string
}

export const posts: SeedPost[] = [
  {
    slug: 'core-web-vitals-practical-checklist',
    title: 'Core Web Vitals: a practical checklist for faster pages',
    excerpt: 'LCP, INP and CLS explained in plain language, with the fixes that move the numbers on real websites.',
    category: 'performance',
    tags: ['Core Web Vitals', 'Performance', 'SEO'],
    cover: '/seed/post-core-web-vitals.svg',
    daysAgo: 6,
    featured: true,
    content:
      '<p>Core Web Vitals are Google’s way of measuring how a page feels to a real person. They are a small ranking signal, but a large conversion signal: faster pages keep visitors. Here is the checklist I run on every project.</p><h2>Largest Contentful Paint (LCP)</h2><p>LCP measures how quickly the main content appears. Aim for under 2.5 seconds on mobile.</p><ul><li>Serve the hero image in a modern format at the right size, and do not lazy-load it.</li><li>Preload the one or two fonts you actually use, and avoid font files you never render.</li><li>Cache HTML at the edge or use stale-while-revalidate so the server responds fast.</li></ul><h2>Interaction to Next Paint (INP)</h2><p>INP tracks how quickly the page responds to taps and clicks. Keep it under 200 milliseconds.</p><ul><li>Split large JavaScript bundles and load heavy widgets only when needed.</li><li>Break up long tasks so the main thread stays responsive.</li><li>Avoid expensive work inside click handlers; defer it.</li></ul><h2>Cumulative Layout Shift (CLS)</h2><p>CLS captures annoying jumps. Keep it under 0.1.</p><ul><li>Always set width and height (or aspect ratio) on images and embeds.</li><li>Reserve space for banners, ads and late-loading components.</li><li>Use <code>font-display: swap</code> with a metric-compatible fallback font.</li></ul><h2>Measure what real users see</h2><p>Lab tools like Lighthouse are great for debugging, but field data in Search Console tells you whether real visitors are having a good experience. Fix the templates that affect the most URLs first.</p>'
  },
  {
    slug: 'technical-seo-audit-in-an-afternoon',
    title: 'How to run a technical SEO audit in an afternoon',
    excerpt: 'A repeatable five-step process for finding the technical problems that actually hold a website back.',
    category: 'seo',
    tags: ['Technical SEO', 'Audit'],
    cover: '/seed/post-seo-audit.svg',
    daysAgo: 14,
    featured: true,
    content:
      '<p>You do not need a week to find the biggest technical SEO problems. With a clear process, an afternoon is enough to produce a useful, prioritised list.</p><h2>1. Check indexation first</h2><p>Open Search Console and compare submitted pages with indexed pages. Large gaps usually point to canonicalisation mistakes, accidental noindex tags or thin duplicate pages.</p><h2>2. Crawl the site</h2><p>Run a crawler and look for broken links, redirect chains, missing titles, duplicate meta descriptions and pages that are more than three clicks from the homepage.</p><h2>3. Review performance</h2><p>Check Core Web Vitals field data per template. Product pages, articles and category pages often behave very differently.</p><h2>4. Validate structured data</h2><p>Make sure schema markup is present, accurate and matches what is on the page. Wrong markup is worse than none.</p><h2>5. Prioritise</h2><p>Score every issue by impact and effort. Fix high-impact, low-effort items first and schedule the rest.</p><blockquote>An audit is only valuable if it ends in a ranked list of actions, not a 90-page PDF.</blockquote>'
  },
  {
    slug: 'nuxt-seo-setup-i-use-on-every-project',
    title: 'Nuxt SEO: the setup I use on every client project',
    excerpt: 'Meta tags, sitemaps, structured data and rendering choices that make a Nuxt site easy for search engines to love.',
    category: 'web-development',
    tags: ['Nuxt', 'SEO', 'Vue'],
    cover: '/seed/post-nuxt-seo.svg',
    daysAgo: 24,
    featured: false,
    content:
      '<p>Nuxt gives you server rendering out of the box, which is a strong start for SEO. These are the extra pieces I add so nothing is left to chance.</p><h2>Render on the server</h2><p>Content that matters for search should be in the initial HTML. Use server rendering or static generation for public pages, and client-only rendering for private areas such as an admin panel.</p><h2>One source of truth for meta</h2><p>Set sensible defaults for title templates and descriptions, then override them per page. Every page needs a unique title, a unique description and a canonical URL.</p><h2>Sitemap and robots</h2><p>Generate the sitemap from your database so new pages appear automatically, and block only what you must (admin, API) in robots.txt.</p><h2>Structured data</h2><p>Add Person or Organization schema sitewide, Article schema to blog posts and BreadcrumbList to nested pages. Validate it before you ship.</p><h2>Images and fonts</h2><p>Use responsive, modern image formats and preload only the critical fonts. These two changes alone often improve LCP dramatically.</p>'
  },
  {
    slug: 'why-site-migrations-lose-traffic',
    title: 'Why site migrations lose traffic (and how to prevent it)',
    excerpt: 'Redesigns fail SEO for predictable reasons. Here is the pre-launch plan that keeps your rankings intact.',
    category: 'seo',
    tags: ['Migration', 'Technical SEO'],
    cover: '/seed/post-migration.svg',
    daysAgo: 38,
    featured: false,
    content:
      '<p>A redesign can quietly delete years of SEO work. Almost every traffic drop after a migration comes from a handful of avoidable mistakes.</p><h2>The usual suspects</h2><ul><li>URLs change without 301 redirects, so ranking pages return 404.</li><li>Titles, headings and body content are rewritten, removing the relevance that earned the ranking.</li><li>Internal links break or are replaced with JavaScript-only navigation.</li><li>A staging <code>noindex</code> tag ships to production.</li></ul><h2>A safer plan</h2><ol><li>Crawl the old site and export every URL with its traffic and links.</li><li>Map each old URL to its new equivalent and test every redirect.</li><li>Keep the content and internal links that perform.</li><li>Crawl the staging site and compare it to the old one before launch.</li><li>After launch, monitor indexing, rankings and errors daily for at least a month.</li></ol><p>Migrations that are planned this way routinely hold traffic — and often grow it, because the new site is faster and cleaner.</p>'
  },
  {
    slug: 'cms-or-custom-backend-for-business-site',
    title: 'Choosing between a CMS and a custom backend for your business site',
    excerpt: 'A simple framework for deciding what your website actually needs to run on — without overbuilding.',
    category: 'web-development',
    tags: ['CMS', 'Architecture'],
    cover: '/seed/post-cms.svg',
    daysAgo: 52,
    featured: false,
    content:
      '<p>“Should we use WordPress, a headless CMS or build something custom?” is the question I hear most before a project starts. The answer depends on three things.</p><h2>1. Who edits the content?</h2><p>If non-technical people publish often, you need a friendly editor. A traditional or headless CMS is usually the fastest route.</p><h2>2. How unusual is the logic?</h2><p>Brochure sites, blogs and portfolios are content-shaped. Quote calculators, portals and bookings are application-shaped. The more logic you have, the more a custom backend makes sense.</p><h2>3. What will maintenance cost?</h2><p>Plugins and integrations need updating. Custom code needs a developer. Estimate the cost over three years, not just the build.</p><h2>My rule of thumb</h2><p>Start with the simplest thing that supports your content and growth plans. A small custom admin on a solid framework is often easier to maintain than a heavily extended CMS — and it is always faster.</p>'
  },
  {
    slug: 'internal-linking-underrated-ranking-lever',
    title: 'Internal linking: the underrated ranking lever',
    excerpt: 'How to use links you fully control to push authority to the pages that make you money.',
    category: 'seo',
    tags: ['On-page SEO', 'Content'],
    cover: '/seed/post-internal-links.svg',
    daysAgo: 70,
    featured: false,
    content:
      '<p>Backlinks get the attention, but internal links are the ranking lever you fully control. They tell search engines which pages matter and help visitors find what they need.</p><h2>Principles that work</h2><ul><li>Link from strong pages to the pages you want to rank.</li><li>Use descriptive anchor text — “technical SEO audit”, not “click here”.</li><li>Keep important pages within three clicks of the homepage.</li><li>Add contextual links inside the body copy, not only in menus.</li></ul><h2>A simple routine</h2><p>Every time you publish, link to two or three relevant existing pages and update two older pages to link to the new one. Review orphan pages quarterly: any page with no internal links is invisible to both users and crawlers.</p><h2>Measure it</h2><p>Track impressions and average position for the target pages in Search Console over the following weeks. Small changes compound quickly on well-structured sites.</p>'
  }
]

export const testimonials = [
  {
    name: 'Sarah Mitchell', role: 'Founder', company: 'Northwind Outfitters', rating: 5,
    quote: 'The new storefront is dramatically faster and our organic revenue climbed within a quarter. Communication was clear at every step, and the handover left my team confident.'
  },
  {
    name: 'Dr. Omar Haddad', role: 'Practice Owner', company: 'Lumen Dental Clinic', rating: 5,
    quote: 'We went from barely being found online to a steady stream of appointment requests. The site is beautiful, simple for patients and easy for us to update.'
  },
  {
    name: 'Priya Nair', role: 'Operations Lead', company: 'Atlas Freight', rating: 5,
    quote: 'The tracking portal removed most of our status emails overnight. It was delivered on schedule and exactly to the brief — a rare thing in software projects.'
  },
  {
    name: 'Daniel Brooks', role: 'Managing Partner', company: 'Summit Legal', rating: 5,
    quote: 'After a bad experience with a previous redesign, I was nervous about migrating. The careful SEO planning meant our traffic did not dip — it more than doubled.'
  },
  {
    name: 'Elena Rossi', role: 'Creative Director', company: 'Pixel & Pine Studio', rating: 5,
    quote: 'We can finally publish case studies the day a project ships. The admin is a joy to use and the site scores near-perfect on speed.'
  }
]

export const skills = [
  { name: 'Nuxt / Vue 3', category: 'Frontend', level: 95 },
  { name: 'TypeScript', category: 'Frontend', level: 92 },
  { name: 'Tailwind CSS', category: 'Frontend', level: 94 },
  { name: 'Accessibility (WCAG)', category: 'Frontend', level: 85 },
  { name: 'Node.js & Nitro', category: 'Backend', level: 90 },
  { name: 'PostgreSQL & Drizzle', category: 'Backend', level: 88 },
  { name: 'REST API design', category: 'Backend', level: 90 },
  { name: 'Authentication & security', category: 'Backend', level: 84 },
  { name: 'Technical SEO', category: 'SEO', level: 96 },
  { name: 'Core Web Vitals', category: 'SEO', level: 94 },
  { name: 'Schema & structured data', category: 'SEO', level: 92 },
  { name: 'Keyword & content strategy', category: 'SEO', level: 86 },
  { name: 'Git & GitHub', category: 'Tools', level: 92 },
  { name: 'Figma', category: 'Tools', level: 78 },
  { name: 'Search Console & GA4', category: 'Tools', level: 93 },
  { name: 'Lighthouse & DevTools', category: 'Tools', level: 95 }
]

export const experiences = [
  {
    role: 'Freelance Full-Stack Developer & SEO Consultant', company: 'Independent', location: 'Remote',
    startDate: '2022', endDate: null,
    description: 'Building websites, web apps and SEO programmes for clients in e-commerce, healthcare, legal and logistics. Focus on performance, search visibility and maintainable code.'
  },
  {
    role: 'Senior Front-End Developer', company: 'Brightwave Digital', location: 'Remote',
    startDate: '2020', endDate: '2022',
    description: 'Led front-end delivery for 20+ client sites in Vue and Nuxt, introduced a shared component library and cut average page weight by 45%.'
  },
  {
    role: 'Web Developer & SEO Analyst', company: 'Orbit Media Works', location: 'On-site',
    startDate: '2018', endDate: '2020',
    description: 'Developed marketing websites and ran technical SEO audits that grew client organic traffic by an average of 70% year over year.'
  }
]

export const educations = [
  {
    degree: 'B.Sc. in Computer Science', institution: 'State University of Technology',
    startDate: '2014', endDate: '2018',
    description: 'Focused on software engineering, databases and web technologies.'
  }
]

export const certifications = [
  { name: 'Google Analytics Certification', issuer: 'Google', year: 2023, url: null },
  { name: 'Core Web Vitals Specialist', issuer: 'web.dev Learn', year: 2024, url: null },
  { name: 'Advanced Technical SEO', issuer: 'Search Academy', year: 2022, url: null }
]

export const aboutBio = [
  'I am a full-stack developer and technical SEO specialist. I build websites and web apps that load fast, work on every device and are structured so search engines can find and understand them.',
  'I started out building marketing sites for agencies and quickly noticed the same pattern: beautiful sites that nobody could find. That is why I combine development and SEO in one practice — the best rankings come from a site that is built right from the first line of code.',
  'Today I work directly with founders and small teams. You get one person who designs the structure, writes the code, sets up analytics and stays accountable for the results. I keep my client list small so every project gets proper attention.',
  'Outside of client work I write about performance and SEO, contribute to open-source tools and keep learning in public.'
].join('\n\n')
