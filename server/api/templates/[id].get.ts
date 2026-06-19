import { getKV } from '../../utils/kv'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Template ID is required' })
  }

  const key = `template:${id}`
  const kv = getKV(event)
  
  const template = await kv.get(key)
  if (!template) {
    throw createError({ statusCode: 404, message: 'Template not found' })
  }

  return template
})
