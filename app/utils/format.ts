export function formatDate(value: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts }).format(new Date(value))
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

/** "5 minutes ago", "yesterday", falling back to a date for older values. */
export function timeAgo(value: string | Date): string {
  const diff = Date.now() - new Date(value).getTime()
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [['day', 86_400_000], ['hour', 3_600_000], ['minute', 60_000]]
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return diff > 7 * 86_400_000 ? formatDate(value) : rtf.format(-Math.round(diff / ms), unit)
  }
  return 'just now'
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('')
}

export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? singular : plural}`
}

/** "2022" – "Present" style ranges for timelines. */
export function dateRange(start: string, end: string | null): string {
  return `${start} – ${end || 'Present'}`
}
