import { getKV } from '../../utils/kv'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Template ID is required' })
  }

  const key = `template:${id}`
  const kv = getKV(event)
  
  const existing = await kv.get(key)
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Template not found' })
  }

  await kv.delete(key)

  return { success: true, message: 'Template deleted successfully' }
})
