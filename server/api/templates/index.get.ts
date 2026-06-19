import { getKV } from '../../utils/kv'

export default defineEventHandler(async (event) => {
  const kv = getKV(event)
  const listResult = await kv.list({ prefix: 'template:' })
  const templates = []

  for (const key of listResult.keys) {
    const template = await kv.get(key.name)
    if (template) {
      // Ensure the id matches the portion after "template:" just in case
      const id = key.name.substring('template:'.length)
      templates.push({
        ...template,
        id
      })
    }
  }

  // Sort by creation date descending
  templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return templates
})
