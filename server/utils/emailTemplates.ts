import { escapeHtml as esc } from './http'

// Responsive, inline-styled, table-based markup that renders consistently across mail clients.
const ACCENT = '#5B3DF5'

interface Layout {
  siteName: string
  preheader: string
  heading: string
  bodyHtml: string
  cta?: { label: string; url: string }
  footer?: string
}

export function emailLayout(o: Layout): string {
  const cta = o.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 4px"><tr><td style="background:${ACCENT};border-radius:10px"><a href="${esc(o.cta.url)}" style="display:inline-block;padding:13px 24px;color:#ffffff;font-weight:600;font-size:15px;text-decoration:none">${esc(o.cta.label)}</a></td></tr></table>`
    : ''
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(o.heading)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f8">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e7e8ee">
<tr><td style="padding:22px 32px;border-bottom:1px solid #e7e8ee"><span style="font-size:16px;font-weight:700;color:#0f1220">${esc(o.siteName)}</span></td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0f1220">${esc(o.heading)}</h1>
${o.bodyHtml}${cta}
</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid #e7e8ee;color:#757a8c;font-size:12px;line-height:1.5">${esc(o.footer ?? `Sent by ${o.siteName}.`)}</td></tr>
</table></td></tr></table></body></html>`
}

const p = (html: string) => `<p style="margin:0 0 14px;color:#3c4257;font-size:15px;line-height:1.65">${html}</p>`

function detailRow(label: string, value: string) {
  return `<tr><td style="padding:8px 0;color:#757a8c;font-size:13px;width:110px;vertical-align:top">${esc(label)}</td><td style="padding:8px 0;color:#0f1220;font-size:15px">${value}</td></tr>`
}

function messageBox(text: string) {
  return `<div style="margin:16px 0 0;padding:16px 18px;background:#f6f6f9;border-radius:12px;color:#0f1220;font-size:15px;line-height:1.65;white-space:pre-wrap">${esc(text)}</div>`
}

export interface NewMessageData {
  siteName: string
  name: string
  email: string
  service: string | null
  budget: string | null
  message: string
  receivedAt: string
  dashboardUrl: string
}

export function newMessageEmail(d: NewMessageData) {
  const subject = `New ${d.service ? 'quote request' : 'message'} from ${d.name}`
  const html = emailLayout({
    siteName: d.siteName,
    preheader: `${d.name} wrote: ${d.message.slice(0, 90)}`,
    heading: subject,
    bodyHtml:
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7e8ee;border-bottom:1px solid #e7e8ee">` +
      detailRow('Name', esc(d.name)) +
      detailRow('Email', `<a href="mailto:${esc(d.email)}" style="color:${ACCENT}">${esc(d.email)}</a>`) +
      detailRow('Service', esc(d.service ?? 'Not specified')) +
      (d.budget ? detailRow('Budget', esc(d.budget)) : '') +
      detailRow('Received', esc(d.receivedAt)) +
      `</table>${messageBox(d.message)}` +
      p(`<span style="color:#757a8c;font-size:13px">Hit reply to answer ${esc(d.name)} directly.</span>`),
    cta: { label: 'Open in dashboard', url: d.dashboardUrl }
  })
  const text = `${subject}\n\nName: ${d.name}\nEmail: ${d.email}\nService: ${d.service ?? 'Not specified'}\n${d.budget ? `Budget: ${d.budget}\n` : ''}Received: ${d.receivedAt}\n\n${d.message}\n\nOpen in dashboard: ${d.dashboardUrl}`
  return { subject, html, text }
}

export function autoReplyEmail(siteName: string, name: string, body: string, copy: string) {
  const subject = `Thanks for reaching out, ${name.split(' ')[0]}`
  const html = emailLayout({
    siteName,
    preheader: 'I have received your message.',
    heading: `Hi ${name.split(' ')[0]},`,
    bodyHtml: p(esc(body)) + p('<strong>Your message</strong>') + messageBox(copy),
    footer: `You are receiving this because you contacted ${siteName} through the website contact form.`
  })
  return { subject, html, text: `Hi ${name},\n\n${body}\n\nYour message:\n${copy}` }
}

export function replyEmail(siteName: string, subject: string, body: string) {
  const html = emailLayout({
    siteName,
    preheader: body.slice(0, 100),
    heading: subject,
    bodyHtml: `<div style="color:#3c4257;font-size:15px;line-height:1.7;white-space:pre-wrap">${esc(body)}</div>`
  })
  return { subject, html, text: body }
}

export function passwordResetEmail(siteName: string, url: string) {
  const subject = 'Reset your admin password'
  const html = emailLayout({
    siteName,
    preheader: 'Use this link to choose a new password. It expires in 30 minutes.',
    heading: 'Reset your password',
    bodyHtml: p('Someone requested a password reset for the admin account. The link below is valid for 30 minutes and can be used once.') +
      p('If you did not request this, you can safely ignore this email.'),
    cta: { label: 'Choose a new password', url }
  })
  return { subject, html, text: `Reset your password (valid 30 minutes): ${url}` }
}

export function alertEmail(siteName: string, title: string, lines: string[], url: string) {
  const html = emailLayout({
    siteName,
    preheader: title,
    heading: title,
    bodyHtml: lines.map(l => p(esc(l))).join(''),
    cta: { label: 'Open dashboard', url }
  })
  return { subject: title, html, text: `${title}\n\n${lines.join('\n')}\n\n${url}` }
}

export interface WeeklySummaryData {
  siteName: string
  weekLabel: string
  messages: number
  unread: number
  views: number
  viewsPrev: number
  topPages: { path: string; views: number }[]
  dashboardUrl: string
}

export function weeklySummaryEmail(d: WeeklySummaryData) {
  const subject = `Your week on ${d.siteName}: ${d.messages} message${d.messages === 1 ? '' : 's'}, ${d.views} views`
  const delta = d.viewsPrev ? Math.round(((d.views - d.viewsPrev) / d.viewsPrev) * 100) : null
  const top = d.topPages.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${d.topPages.map(t => detailRow(t.path, `${t.views} views`)).join('')}</table>`
    : p('No page views were recorded this week.')
  const html = emailLayout({
    siteName: d.siteName,
    preheader: subject,
    heading: `Weekly summary · ${d.weekLabel}`,
    bodyHtml:
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7e8ee;border-bottom:1px solid #e7e8ee">` +
      detailRow('New messages', String(d.messages)) +
      detailRow('Unread now', String(d.unread)) +
      detailRow('Page views', `${d.views}${delta === null ? '' : ` (${delta >= 0 ? '+' : ''}${delta}% vs last week)`}`) +
      `</table>${p('<strong>Top pages</strong>')}${top}`,
    cta: { label: 'Open dashboard', url: d.dashboardUrl }
  })
  return { subject, html, text: `${subject}\n\n${d.topPages.map(t => `${t.path}: ${t.views}`).join('\n')}\n${d.dashboardUrl}` }
}

export function testEmail(siteName: string) {
  const subject = 'Test email from your portfolio admin'
  const html = emailLayout({
    siteName,
    preheader: 'SMTP is working.',
    heading: 'SMTP is working',
    bodyHtml: p('This is a test message sent from the admin panel. If you can read it, your SMTP settings are correct.')
  })
  return { subject, html, text: 'This is a test message sent from the admin panel. SMTP is working.' }
}
