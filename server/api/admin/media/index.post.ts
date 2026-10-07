import { randomBytes } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { mediaAsset } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const parts = await readMultipartFormData(event)
  const files = (parts ?? []).filter(p => p.filename && p.data?.length)
  if (!files.length) throw apiError(400, 'No file was uploaded.')
  if (files.length > 20) throw apiError(400, 'Upload at most 20 files at a time.')

  const dir = await uploadsDir()
  const db = useDb()
  const created = []

  for (const file of files) {
    if (file.data.length > MAX_UPLOAD_BYTES) throw apiError(413, `${file.filename} is larger than 10 MB.`)
    const detected = detectKind(file.data)
    if (!detected) throw apiError(415, `${file.filename} is not a supported file. Use JPG, PNG, WebP, GIF, AVIF or PDF.`)

    const id = randomBytes(16).toString('hex')
    let buffer = file.data
    let ext = 'pdf'
    let width: number | null = null
    let height: number | null = null
    let mime = 'application/pdf'

    if (detected.kind === 'image') {
      try {
        // Re-encoding strips metadata and neutralises malformed or polyglot files.
        const out = await sharp(file.data, { limitInputPixels: 80_000_000 })
          .rotate()
          .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer({ resolveWithObject: true })
        buffer = out.data
        width = out.info.width
        height = out.info.height
      } catch {
        throw apiError(415, `${file.filename} could not be processed as an image.`)
      }
      ext = 'webp'
      mime = 'image/webp'
    }

    const filename = `${id}.${ext}`
    await writeFile(join(dir, filename), buffer)
    const original = (file.filename ?? 'file').replace(/[^\w.\- ]+/g, '_').slice(0, 120)
    const [row] = await db
      .insert(mediaAsset)
      .values({ filename, originalName: original, mime, size: buffer.length, width, height, alt: '' })
      .returning()
    if (row) created.push(row)
  }

  await logActivity(user.email, 'create', 'Media', null, `Uploaded ${created.length} file(s)`)
  setResponseStatus(event, 201)
  return created
})
