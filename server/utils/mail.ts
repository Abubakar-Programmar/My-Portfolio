import nodemailer, { type Transporter } from 'nodemailer'
import { emailLog } from '../database/schema'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    const { mail } = useRuntimeConfig()
    const port = Number(mail.port) || 587
    const implicitTls = port === 465 || mail.encryption.toLowerCase() === 'ssl'
    transporter = nodemailer.createTransport({
      host: mail.host,
      port,
      secure: implicitTls,
      requireTLS: !implicitTls && mail.encryption.toLowerCase() === 'tls',
      auth: mail.username ? { user: mail.username, pass: mail.password } : undefined,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000
    })
  }
  return transporter
}

export function mailConfigured(): boolean {
  const { mail } = useRuntimeConfig()
  return Boolean(mail.host && mail.fromAddress)
}

/** Checks the SMTP connection. Logs only success/failure, never credentials. */
export async function verifySmtp(): Promise<{ ok: boolean; error?: string }> {
  if (!mailConfigured()) return { ok: false, error: 'SMTP is not configured' }
  try {
    await getTransporter().verify()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'SMTP verification failed' }
  }
}

export interface OutgoingMail {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  kind: string
  notificationId?: string | null
}

const BACKOFF_MS = [0, 1500, 5000]

/** Sends an email with retry/backoff and records the delivery result in email_log. */
export async function sendMail(mail: OutgoingMail): Promise<{ ok: boolean; error?: string }> {
  const config = useRuntimeConfig().mail
  let lastError = ''
  let attempts = 0

  if (!mailConfigured()) {
    lastError = 'SMTP is not configured'
  } else {
    for (const delay of BACKOFF_MS) {
      if (delay) await new Promise(resolve => setTimeout(resolve, delay))
      attempts++
      try {
        await getTransporter().sendMail({
          from: { name: config.fromName, address: config.fromAddress },
          to: mail.to,
          replyTo: mail.replyTo,
          subject: mail.subject,
          text: mail.text,
          html: mail.html
        })
        lastError = ''
        break
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Unknown SMTP error'
        transporter = null // rebuild the connection on the next attempt
      }
    }
  }

  const ok = lastError === ''
  try {
    await useDb().insert(emailLog).values({
      kind: mail.kind,
      toAddress: mail.to,
      subject: mail.subject,
      status: ok ? 'sent' : 'failed',
      attempts: Math.max(attempts, 1),
      error: ok ? null : lastError.slice(0, 500),
      notificationId: mail.notificationId ?? null
    })
  } catch (err) {
    console.error('[mail] could not write email_log:', err instanceof Error ? err.message : err)
  }
  if (!ok) console.warn(`[mail] "${mail.kind}" email failed after ${attempts} attempt(s): ${lastError}`)
  return ok ? { ok } : { ok, error: lastError }
}
