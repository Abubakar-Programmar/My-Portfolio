import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { mediaAsset } from '../../../database/schema'
import { mediaUpdateInput } from '../../../../shared/schemas/content'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = parseInput(z.uuid(), getRouterParam(event, 'id'))
  const { alt } = await readValid(event, mediaUpdateInput)
  const [row] = await useDb().update(mediaAsset).set({ alt }).where(eq(mediaAsset.id, id)).returning()
  if (!row) throw apiError(404, 'File not found')
  await logActivity(user.email, 'update', 'Media', id, `Updated alt text for ${row.originalName}`)
  return { ...row, url: `/media/${row.filename}` }
})
