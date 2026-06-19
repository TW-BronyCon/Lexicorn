import { getKV } from '../../utils/kv'
import { extractBlanks, autoIncrementPlaceholders, getCanonicalName } from '../../utils/parser'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let { title, rawText, blanksConfig } = body

  if (!title || !title.trim()) {
    throw createError({ statusCode: 400, message: 'Title is required' })
  }
  if (!rawText || !rawText.trim()) {
    throw createError({ statusCode: 400, message: 'Story text is required' })
  }

  // Auto-increment duplicate keys
  rawText = autoIncrementPlaceholders(rawText)

  // Extract placeholders to verify they match and configure defaults
  const occurrences = extractBlanks(rawText)
  const cleanBlanksConfig: Record<string, { category: string; remarks: string }> = {}

  // Build clean config focusing only on placeholders present in the text
  occurrences.forEach((occ) => {
    if (!cleanBlanksConfig[occ.name]) {
      const canonical = getCanonicalName(occ.name)
      const baseName = occ.name.replace(/\s+\d+$/, '').trim()
      const baseCanonical = canonical.replace(/\s+\d+$/, '').trim()

      const existing = blanksConfig?.[occ.name] || 
                       blanksConfig?.[baseName] || 
                       blanksConfig?.[canonical] || 
                       blanksConfig?.[baseCanonical]

      cleanBlanksConfig[occ.name] = {
        category: existing?.category || '',
        remarks: existing?.remarks || ''
      }
    }
  })

  const rawId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const key = `template:${rawId}`
  
  const newTemplate = {
    id: rawId,
    title: title.trim(),
    rawText,
    blanksConfig: cleanBlanksConfig,
    createdAt: new Date().toISOString()
  }

  const kv = getKV(event)
  await kv.put(key, newTemplate)

  return newTemplate
})
