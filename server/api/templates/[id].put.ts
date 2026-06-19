import { getKV } from '../../utils/kv'
import { extractBlanks } from '../../utils/parser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Template ID is required' })
  }

  const body = await readBody(event)
  const { title, rawText, blanksConfig } = body

  if (!title || !title.trim()) {
    throw createError({ statusCode: 400, message: 'Title is required' })
  }
  if (!rawText || !rawText.trim()) {
    throw createError({ statusCode: 400, message: 'Story text is required' })
  }

  const key = `template:${id}`
  const kv = getKV(event)
  const existingTemplate = await kv.get(key)
  if (!existingTemplate) {
    throw createError({ statusCode: 404, message: 'Template not found' })
  }

  // Parse new blanks structure
  const occurrences = extractBlanks(rawText)
  const cleanBlanksConfig: Record<string, { category: string; remarks: string }> = {}

  occurrences.forEach((occ) => {
    if (!cleanBlanksConfig[occ.name]) {
      const existing = blanksConfig?.[occ.name] || existingTemplate.blanksConfig?.[occ.name]
      cleanBlanksConfig[occ.name] = {
        category: existing?.category || '',
        remarks: existing?.remarks || ''
      }
    }
  })

  const updatedTemplate = {
    ...existingTemplate,
    id,
    title: title.trim(),
    rawText,
    blanksConfig: cleanBlanksConfig,
    updatedAt: new Date().toISOString()
  }

  await kv.put(key, updatedTemplate)

  return updatedTemplate
})
