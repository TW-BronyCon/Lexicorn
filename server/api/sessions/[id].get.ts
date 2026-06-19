import { getKV } from '../../utils/kv'
import { renderStory } from '../../utils/parser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Session ID is required' })
  }

  const query = getQuery(event)
  const isViewerMode = query.view === 'viewer'

  const kv = getKV(event)
  const session = await kv.get(`session:${id.toUpperCase()}`)
  if (!session) {
    throw createError({ statusCode: 404, message: 'Session not found' })
  }

  const hostTokenHeader = getHeader(event, 'x-host-token')
  const isHost = hostTokenHeader === session.hostToken

  const queue = session.queue || []
  const blanks = session.blanks || []
  const answers = session.answers || {}

  if (isHost && !isViewerMode) {
    // Host gets full access
    return {
      isHost: true,
      id: session.id,
      title: session.title,
      status: session.status,
      blanks: blanks,
      queue: queue,
      currentQueueIndex: session.currentQueueIndex || 0,
      answers: answers,
      rawText: session.rawText || '',
      // Provide a pre-rendered story preview for convenience if in reveal mode
      finalStory: session.status === 'reveal' ? renderStory(session.rawText || '', answers) : null,
      finalStoryPreview: renderStory(session.rawText || '', answers),
      currentCandidate: session.currentCandidate || ''
    }
  }

  // Viewer view
  if (session.status === 'input') {
    // Count how many blanks have been filled in the queue
    let filledCount = 0
    queue.forEach((blankId: string) => {
      const blank = blanks.find((b: any) => b.id === blankId)
      if (blank) {
        const ans = answers[blank.canonicalName]
        if (ans !== undefined && ans !== null && ans.trim() !== '') {
          filledCount++
        }
      }
    })

    // Map blanks in queue order, masking details for future blanks
    const revealedBlankIds = session.revealedBlankIds || (queue.length > 0 ? [queue[0]] : [])
    const viewerBlanks = queue.map((blankId: string, queueIndex: number) => {
      const blank = blanks.find((b: any) => b.id === blankId)
      const isRevealed = revealedBlankIds.includes(blankId) || (blank && answers[blank.canonicalName] !== undefined && answers[blank.canonicalName] !== null && answers[blank.canonicalName].trim() !== '')

      if (blank && isRevealed) {
        const ans = answers[blank.canonicalName]
        const isAnswered = ans !== undefined && ans !== null && ans.trim() !== ''
        return {
          id: blank.id,
          name: blank.name,
          category: blank.category,
          remarks: blank.remarks,
          isAnswered,
          isRevealed: true,
          answer: isAnswered ? ans : null
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
      isHost: isHost,
      id: session.id,
      title: session.title,
      status: session.status,
      totalBlanks: queue.length,
      filledBlanks: filledCount,
      currentQueueIndex: session.currentQueueIndex || 0,
      blanks: viewerBlanks,
      finalStoryPreview: isHost ? renderStory(session.rawText || '', answers) : null,
      currentCandidate: session.currentCandidate || ''
    }
  } else {
    // Reveal status: viewers see the final rendered story
    return {
      isHost: isHost,
      id: session.id,
      title: session.title,
      status: session.status,
      finalStory: renderStory(session.rawText || '', answers)
    }
  }
})
