import { getKV } from '../../utils/kv'
import { extractBlanks } from '../../utils/parser'

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateHostToken(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { templateId } = body

  if (!templateId) {
    throw createError({ statusCode: 400, message: 'Template ID is required' })
  }

  const kv = getKV(event)
  const template = await kv.get(`template:${templateId}`)
  if (!template) {
    throw createError({ statusCode: 404, message: 'Template not found' })
  }

  // Generate unique 6-character code
  let sessionId = generateSessionId()
  let attempts = 0
  while (attempts < 10) {
    const existing = await kv.get(`session:${sessionId}`)
    if (!existing) break
    sessionId = generateSessionId()
    attempts++
  }

  // Extract blanks and build configuration
  const occurrences = extractBlanks(template.rawText)
  const sessionBlanks = occurrences.map((occ) => {
    const config = template.blanksConfig?.[occ.name]
    return {
      id: occ.id,
      name: occ.name,
      canonicalName: occ.canonicalName,
      category: config?.category || '',
      remarks: config?.remarks || ''
    }
  })

  // Create randomized queue of blank IDs
  const queue = shuffleArray(sessionBlanks.map(b => b.id))
  
  const hostToken = generateHostToken()
  const sessionState = {
    id: sessionId,
    hostToken,
    templateId,
    title: template.title,
    rawText: template.rawText,
    blanks: sessionBlanks,
    queue,
    currentQueueIndex: 0,
    answers: {}, // Maps canonicalName -> answer
    status: 'input', // 'input' | 'reveal'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  await kv.put(`session:${sessionId}`, sessionState)

  return {
    sessionId,
    hostToken,
    session: {
      id: sessionId,
      title: template.title,
      blanksCount: sessionBlanks.length,
      status: 'input'
    }
  }
})
