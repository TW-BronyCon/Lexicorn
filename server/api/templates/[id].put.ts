import { getKV } from '../../utils/kv'
import { extractBlanks, autoIncrementPlaceholders, getCanonicalName } from '../../utils/parser'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Template ID is required' })
  }

  const body = await readBody(event)
  let { title, rawText, blanksConfig } = body

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

  // Auto-increment duplicate keys
  rawText = autoIncrementPlaceholders(rawText)

  // Parse new blanks structure
  const occurrences = extractBlanks(rawText)
  const cleanBlanksConfig: Record<string, { category: string; remarks: string }> = {}

  occurrences.forEach((occ) => {
    if (!cleanBlanksConfig[occ.name]) {
      const canonical = getCanonicalName(occ.name)
      const baseName = occ.name.replace(/\s+\d+$/, '').trim()
      const baseCanonical = canonical.replace(/\s+\d+$/, '').trim()

      const existing = blanksConfig?.[occ.name] || 
                       existingTemplate.blanksConfig?.[occ.name] ||
                       blanksConfig?.[baseName] || 
                       existingTemplate.blanksConfig?.[baseName] ||
                       blanksConfig?.[canonical] || 
                       existingTemplate.blanksConfig?.[canonical] ||
                       blanksConfig?.[baseCanonical] ||
                       existingTemplate.blanksConfig?.[baseCanonical]

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
