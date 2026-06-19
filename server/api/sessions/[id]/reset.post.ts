import { getKV } from '../../../utils/kv'

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
    throw createError({ statusCode: 404, message: 'Session not found' })
  }

  if (session.hostToken !== hostTokenHeader) {
    throw createError({ statusCode: 403, message: 'Unauthorized host token' })
  }

  // Restore the queue to initial FIFO order
  const orderedQueue = session.blanks.map((b: any) => b.id)

  session.answers = {}
  session.currentQueueIndex = 0
  session.status = 'input'
  session.queue = orderedQueue
  session.currentCandidate = ''
  session.updatedAt = new Date().toISOString()

  await kv.put(sessionKey, session)

  return {
    success: true,
    session: {
      id: session.id,
      title: session.title,
      status: session.status,
      blanks: session.blanks,
      queue: session.queue,
      currentQueueIndex: session.currentQueueIndex,
      answers: session.answers,
      rawText: session.rawText
    }
  }
})
