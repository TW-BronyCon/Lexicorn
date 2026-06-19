import { getKV } from '../../utils/kv'
import { renderStory } from '../../utils/parser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Session ID is required' })
  }

  const kv = getKV(event)
  const session = await kv.get(`session:${id.toUpperCase()}`)
  if (!session) {
    throw createError({ statusCode: 404, message: 'Session not found' })
  }

  const hostTokenHeader = getHeader(event, 'x-host-token')
  const isHost = hostTokenHeader === session.hostToken

  if (isHost) {
    // Host gets full access
    return {
      isHost: true,
      id: session.id,
      title: session.title,
      status: session.status,
      blanks: session.blanks,
      queue: session.queue,
      currentQueueIndex: session.currentQueueIndex,
      answers: session.answers,
      rawText: session.rawText,
      // Provide a pre-rendered story preview for convenience if in reveal mode
      finalStory: session.status === 'reveal' ? renderStory(session.rawText, session.answers) : null
    }
  }

  // Viewer view
  if (session.status === 'input') {
    // Count how many blanks have been filled in the queue
    let filledCount = 0
    session.queue.forEach((blankId: string) => {
      const blank = session.blanks.find((b: any) => b.id === blankId)
      if (blank && session.answers[blank.canonicalName] !== undefined) {
        filledCount++
      }
    })

    // Map blanks in queue order, masking details for future blanks
    const viewerBlanks = session.queue.map((blankId: string, queueIndex: number) => {
      const blank = session.blanks.find((b: any) => b.id === blankId)
      const isRevealed = queueIndex <= session.currentQueueIndex

      if (blank && isRevealed) {
        return {
          id: blank.id,
          name: blank.name,
          category: blank.category,
          remarks: blank.remarks,
          isAnswered: session.answers[blank.canonicalName] !== undefined,
          isRevealed: true
        }
      } else {
        return {
          id: blankId,
          name: `Word #${queueIndex + 1}`,
          category: 'Locked',
          remarks: 'Waiting for host...',
          isAnswered: false,
          isRevealed: false
        }
      }
    })

    return {
      isHost: false,
      id: session.id,
      title: session.title,
      status: session.status,
      totalBlanks: session.queue.length,
      filledBlanks: filledCount,
      currentQueueIndex: session.currentQueueIndex,
      blanks: viewerBlanks
    }
  } else {
    // Reveal status: viewers see the final rendered story
    return {
      isHost: false,
      id: session.id,
      title: session.title,
      status: session.status,
      finalStory: renderStory(session.rawText, session.answers)
    }
  }
})
