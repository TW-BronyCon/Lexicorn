import { getKV } from '../../utils/kv'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Session ID is required' })
  }

  const hostTokenHeader = getHeader(event, 'x-host-token')
  if (!hostTokenHeader) {
    throw createError({ statusCode: 401, message: 'Host token is required' })
  }

  const kv = getKV(event)
  const sessionKey = `session:${id.toUpperCase()}`
  const session = await kv.get(sessionKey)
  if (!session) {
    return { success: true, message: 'Session not found or already deleted' }
  }

  if (session.hostToken !== hostTokenHeader) {
    throw createError({ statusCode: 403, message: 'Unauthorized host token' })
  }

  await kv.delete(sessionKey)

  return {
    success: true,
    message: 'Session deleted successfully'
  }
})
