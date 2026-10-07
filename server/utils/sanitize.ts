import sanitize from 'sanitize-html'
import { slugify } from '../../shared/utils/text'

const ALLOWED_TAGS = [
  'p', 'br', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 's',
  'a', 'img', 'hr', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
]

/** Whitelist-based sanitising of rich text produced by the Tiptap editor. */
export function sanitizeRichText(html: string): string {
  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
      code: ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? '')
        return {
          tagName: 'a',
          attribs: { ...attribs, ...(external ? { rel: 'noopener noreferrer', target: '_blank' } : {}) }
        }
      },
      img: (tag, attribs) => ({ tagName: 'img', attribs: { ...attribs, loading: 'lazy' } })
    }
  })
}

export interface TocItem { id: string; text: string; level: 2 | 3 }

/** Adds stable ids to h2/h3 headings and returns the table of contents. */
export function withHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  const used = new Set<string>()
  const out = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, level: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, '').trim()
    let id = slugify(text) || 'section'
    let n = 2
    while (used.has(id)) id = `${slugify(text) || 'section'}-${n++}`
    used.add(id)
    toc.push({ id, text, level: Number(level) as 2 | 3 })
    return `<h${level} id="${id}">${inner}</h${level}>`
  })
  return { html: out, toc }
}
