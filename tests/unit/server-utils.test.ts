import { describe, expect, it } from 'vitest'
import { dbUrl } from '../../server/database/connection'
import { hashPassword, verifyPassword } from '../../server/database/password'
import { sanitizeRichText, withHeadingIds } from '../../server/utils/sanitize'
import { toCsv } from '../../server/utils/csv'
import { detectKind } from '../../server/utils/media'

describe('sanitizeRichText', () => {
  it('removes scripts, event handlers and javascript: links', () => {
    const out = sanitizeRichText('<p onclick="x()">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><img src="x" onerror="y()">')
    expect(out).not.toMatch(/script|onclick|onerror|javascript:/i)
    expect(out).toContain('<p>Hi</p>')
  })
  it('hardens external links', () => expect(sanitizeRichText('<a href="https://example.com">x</a>')).toContain('rel="noopener noreferrer"'))
  it('keeps editor formatting', () => expect(sanitizeRichText('<h2>T</h2><ul><li><strong>a</strong></li></ul>')).toBe('<h2>T</h2><ul><li><strong>a</strong></li></ul>'))
})

describe('withHeadingIds', () => {
  it('adds unique ids and builds a table of contents', () => {
    const { html, toc } = withHeadingIds('<h2>Intro</h2><h3>Detail</h3><h2>Intro</h2>')
    expect(toc.map(t => t.id)).toEqual(['intro', 'detail', 'intro-2'])
    expect(html).toContain('<h2 id="intro">')
  })
})

describe('toCsv', () => {
  it('quotes values and neutralises formulas', () => {
    const csv = toCsv([{ a: 'x,y', b: '=SUM(A1)', c: 'say "hi"' }])
    expect(csv).toBe('a,b,c\r\n"x,y",\'=SUM(A1),"say ""hi"""')
  })
})

describe('detectKind', () => {
  it('trusts magic bytes, not names', () => {
    expect(detectKind(Buffer.from('%PDF-1.7 hello world'))).toEqual({ kind: 'pdf' })
    expect(detectKind(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]))).toEqual({ kind: 'image' })
    expect(detectKind(Buffer.from('<svg onload=alert(1)></svg>'))).toBeNull()
  })
})

describe('passwords & db url', () => {
  it('hashes with argon2id and verifies', async () => {
    const hash = await hashPassword('correct horse battery')
    expect(hash).toMatch(/^\$argon2id\$/)
    expect(await verifyPassword(hash, 'correct horse battery')).toBe(true)
    expect(await verifyPassword(hash, 'wrong')).toBe(false)
  })
  it('strips ORM-specific query params from DATABASE_URL', () => {
    expect(dbUrl('postgresql://u:p@localhost:5432/db?connection_limit=10&pool_timeout=20')).toBe('postgresql://u:p@localhost:5432/db')
  })
})
