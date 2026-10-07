import { describe, expect, it } from 'vitest'
import { paragraphs, readingMinutes, slugify, stripHtml, truncate } from '../../shared/utils/text'

describe('slugify', () => {
  it('lowercases and hyphenates', () => expect(slugify('Hello World!')).toBe('hello-world'))
  it('strips accents and expands ampersands', () => expect(slugify('Café & Crème')).toBe('cafe-and-creme'))
  it('trims stray separators', () => expect(slugify('  --Hi--  ')).toBe('hi'))
  it('caps the length', () => expect(slugify('a'.repeat(300)).length).toBeLessThanOrEqual(100))
})

describe('stripHtml / readingMinutes', () => {
  it('removes tags, scripts and entities', () => {
    expect(stripHtml('<p>Hi&nbsp;<b>there</b></p><script>alert(1)</script>')).toBe('Hi there')
  })
  it('returns at least one minute', () => expect(readingMinutes('<p>short</p>')).toBe(1))
  it('estimates ~220 words per minute', () => expect(readingMinutes(`<p>${'word '.repeat(660)}</p>`)).toBe(3))
})

describe('truncate / paragraphs', () => {
  it('truncates with an ellipsis', () => expect(truncate('abcdefghij', 5)).toBe('abcd…'))
  it('keeps short strings', () => expect(truncate('abc', 5)).toBe('abc'))
  it('splits on blank lines', () => expect(paragraphs('a\n\n b \n\n\nc')).toEqual(['a', 'b', 'c']))
})
