import { activityLog } from '../database/schema'

/** Records who changed what, shown in the admin Activity log. Never throws. */
export async function logActivity(
  actor: string,
  action: 'create' | 'update' | 'delete' | 'duplicate' | 'login' | 'security' | 'reply' | 'export',
  entity: string,
  entityId: string | null,
  summary: string
) {
  try {
    await useDb().insert(activityLog).values({ actor, action, entity, entityId, summary })
  } catch (err) {
    console.error('[activity] failed to write log entry:', err instanceof Error ? err.message : err)
  }
}
