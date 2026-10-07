import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { mediaAsset } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = parseInput(z.uuid(), getRouterParam(event, 'id'))
  const db = useDb()
  const [row] = await db.select().from(mediaAsset).where(eq(mediaAsset.id, id))
  if (!row) throw apiError(404, 'File not found')

  const usage = await mediaUsage(row.filename)
  if (usage.length) {
    const where = usage.slice(0, 3).map(u => `${u.type} “${u.title}”`).join(', ')
    throw createError({ statusCode: 409, statusMessage: 'File is in use', message: `This file is used by ${where}${usage.length > 3 ? ` and ${usage.length - 3} more` : ''}. Remove it there first.`, data: { usage } })
  }

  await db.delete(mediaAsset).where(eq(mediaAsset.id, id))
  await rm(join(await uploadsDir(), row.filename), { force: true })
  await logActivity(user.email, 'delete', 'Media', id, `Deleted file ${row.originalName}`)
  return { ok: true }
})
