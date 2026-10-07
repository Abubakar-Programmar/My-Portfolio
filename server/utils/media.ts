import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { ilike, or, sql } from 'drizzle-orm'
import { blogPost, project, service, setting, testimonial } from '../database/schema'

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const FILENAME_PATTERN = /^[a-f0-9]{32}\.(webp|pdf)$/

/** Upload directory, configurable via UPLOADS_DIR and kept outside the build output. */
export async function uploadsDir(): Promise<string> {
  const dir = resolve(process.cwd(), useRuntimeConfig().uploadsDir)
  await mkdir(dir, { recursive: true })
  return dir
}

export type DetectedKind = { kind: 'image' } | { kind: 'pdf' } | null

/** Detects the real file type from magic bytes — the client-supplied MIME type is never trusted. */
export function detectKind(buf: Buffer): DetectedKind {
  if (buf.length < 12) return null
  if (buf.subarray(0, 4).toString('latin1') === '%PDF') return { kind: 'pdf' }
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const isWebp = buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP'
  const isGif = buf.subarray(0, 3).toString('latin1') === 'GIF'
  const isAvif = buf.subarray(4, 12).toString('latin1') === 'ftypavif'
  return isJpeg || isPng || isWebp || isGif || isAvif ? { kind: 'image' } : null
}

export interface MediaUsage { type: string; title: string }

/** Finds content that references a media file, so in-use files are never deleted by accident. */
export async function mediaUsage(filename: string): Promise<MediaUsage[]> {
  const db = useDb()
  const like = `%/media/${filename}%`
  const [services, projects, posts, testimonials, settings] = await Promise.all([
    db.select({ title: service.title }).from(service).where(or(ilike(service.coverImage, like), ilike(service.overview, like), sql`${service.images}::text ilike ${like}`)),
    db.select({ title: project.title }).from(project).where(or(ilike(project.coverImage, like), ilike(project.problem, like), ilike(project.solution, like), sql`${project.gallery}::text ilike ${like}`)),
    db.select({ title: blogPost.title }).from(blogPost).where(or(ilike(blogPost.coverImage, like), ilike(blogPost.content, like))),
    db.select({ title: testimonial.name }).from(testimonial).where(ilike(testimonial.avatar, like)),
    db.select({ title: setting.key }).from(setting).where(sql`${setting.value}::text ilike ${like}`)
  ])
  return [
    ...services.map(r => ({ type: 'Service', title: r.title })),
    ...projects.map(r => ({ type: 'Project', title: r.title })),
    ...posts.map(r => ({ type: 'Blog post', title: r.title })),
    ...testimonials.map(r => ({ type: 'Testimonial', title: r.title })),
    ...settings.map(r => ({ type: 'Settings', title: r.title }))
  ]
}
