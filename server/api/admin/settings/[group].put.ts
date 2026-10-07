import { settingSchemas, type SettingGroup } from '../../../../shared/schemas/settings'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const group = getRouterParam(event, 'group') ?? ''
  if (!isSettingGroup(group)) throw apiError(404, 'Unknown settings group')
  const value = parseInput(settingSchemas[group], await readBody(event))
  await saveSettings(group, value as never)
  await logActivity(user.email, 'update', 'Settings', group, `Updated ${group} settings`)
  return (await getSettings())[group as SettingGroup]
})
