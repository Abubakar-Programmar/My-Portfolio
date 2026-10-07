/** Escapes a value for CSV, and neutralises spreadsheet formula injection (=, +, -, @). */
function cell(value: unknown): string {
  let s = value instanceof Date ? value.toISOString() : value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  const cols = columns ?? (rows[0] ? Object.keys(rows[0]) : [])
  return [cols.join(','), ...rows.map(r => cols.map(c => cell(r[c])).join(','))].join('\r\n')
}

export function sendCsv(event: Parameters<typeof setResponseHeaders>[0], filename: string, body: string) {
  setResponseHeaders(event, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="${filename}"`
  })
  // UTF-8 byte-order mark so Excel detects the encoding.
  return String.fromCharCode(0xfeff) + body
}
