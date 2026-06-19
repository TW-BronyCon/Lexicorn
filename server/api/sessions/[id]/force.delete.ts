import { getKV } from '../../../utils/kv'

// Force-delete a session without requiring the host token.
// Used by the host panel's Session Manager to kill any session (even orphaned ones).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Session ID is required' })
  }

  const kv = getKV(event)
  const sessionKey = `session:${id.toUpperCase()}`

  await kv.delete(sessionKey)

  return {
    success: true,
    message: `Session ${id.toUpperCase()} force-deleted`
  }
})
