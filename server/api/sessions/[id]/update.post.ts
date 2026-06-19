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

  const body = await readBody(event)
  const { answers, currentQueueIndex, status } = body

  // Update answers if provided
  if (answers !== undefined) {
    session.answers = {
      ...session.answers,
      ...answers
    }
  }

  // Update current queue index if provided
  if (currentQueueIndex !== undefined) {
    const idx = parseInt(currentQueueIndex, 10)
    if (!isNaN(idx) && idx >= 0 && idx < session.queue.length) {
      session.currentQueueIndex = idx
    }
  }

  // Update status if provided
  if (status !== undefined) {
    if (status === 'input' || status === 'reveal') {
      session.status = status
    }
  }

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
