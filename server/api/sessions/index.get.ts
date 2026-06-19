import { getKV } from '../../utils/kv'

export default defineEventHandler(async (event) => {
  const kv = getKV(event)

  // List all session keys
  const { keys } = await kv.list({ prefix: 'session:' })

  const sessions = []

  for (const { name } of keys) {
    const session = await kv.get(name)
    if (!session) continue

    sessions.push({
      id: session.id,
      title: session.title,
      status: session.status,
      templateId: session.templateId,
      blanksCount: (session.blanks || []).length,
      answeredCount: Object.keys(session.answers || {}).length,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    })
  }

  // Sort by most recently updated first
  sessions.sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return dateB - dateA
  })

  return sessions
})
