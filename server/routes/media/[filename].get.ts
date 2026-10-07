import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { z } from 'zod'

const query = z.object({
  w: z.coerce.number().int().min(16).max(2400).optional(),
  f: z.enum(['webp', 'avif', 'jpeg']).optional()
})

const MIME = { webp: 'image/webp', avif: 'image/avif', jpeg: 'image/jpeg' } as const

// Safe file serving: strict filename pattern (no path traversal), on-demand resized
// variants cached on disk, nosniff and long-lived caching (filenames are random).
export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename') ?? ''
  if (!FILENAME_PATTERN.test(filename)) throw apiError(404, 'Not found')
  const dir = await uploadsDir()
  const { w, f } = queryValid(event, query)
  setResponseHeaders(event, {
    'cache-control': 'public, max-age=31536000, immutable',
    'x-content-type-options': 'nosniff',
    'content-security-policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox"
  })

  try {
    if (filename.endsWith('.pdf')) {
      setResponseHeader(event, 'content-type', 'application/pdf')
      setResponseHeader(event, 'content-disposition', 'inline')
      return await readFile(join(dir, filename))
    }
    if (!w && !f) {
      setResponseHeader(event, 'content-type', 'image/webp')
      return await readFile(join(dir, filename))
    }
    const format = f ?? 'webp'
    const cacheDir = join(dir, '.cache')
    const cached = join(cacheDir, `${filename.slice(0, 32)}-${w ?? 0}.${format}`)
    setResponseHeader(event, 'content-type', MIME[format])
    try {
      return await readFile(cached)
    } catch {
      const out = await sharp(join(dir, filename))
        .resize({ width: w, withoutEnlargement: true })
        .toFormat(format, { quality: 80 })
        .toBuffer()
      await mkdir(cacheDir, { recursive: true })
      await writeFile(cached, out)
      return out
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') throw apiError(404, 'Not found')
    throw err
  }
})
