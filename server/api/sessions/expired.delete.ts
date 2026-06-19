import { getKV } from '../../utils/kv'

// Sessions older than this (ms) are considered "expired"
const EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

export default defineEventHandler(async (event) => {
  const kv = getKV(event)
  const now = Date.now()

  const { keys } = await kv.list({ prefix: 'session:' })

  const deleted: string[] = []
  const skipped: string[] = []

  for (const { name } of keys) {
    const session = await kv.get(name)
    if (!session) continue

    const lastActive = new Date(session.updatedAt || session.createdAt || 0).getTime()
    const age = now - lastActive

    if (age >= EXPIRY_MS) {
      await kv.delete(name)
      deleted.push(session.id)
    } else {
      skipped.push(session.id)
    }
  }

  return {
    success: true,
    deletedCount: deleted.length,
    deleted,
    skippedCount: skipped.length,
    expiryHours: EXPIRY_MS / (60 * 60 * 1000)
  }
})
