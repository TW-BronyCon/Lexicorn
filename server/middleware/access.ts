export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  // Only protect host management panels and template APIs in production environments
  const isHostRoute = url.pathname.startsWith('/host')
  const isTemplatesApi = url.pathname.startsWith('/api/templates')

  if (process.env.NODE_ENV === 'production' && (isHostRoute || isTemplatesApi)) {
    const accessJwt = getHeader(event, 'cf-access-jwt-assertion')
    const accessEmail = getHeader(event, 'cf-access-user-email')

    // If these headers are missing, it indicates the request bypassed Cloudflare Zero Trust
    if (!accessJwt && !accessEmail) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: This section of the application is protected behind Cloudflare Access.',
      })
    }
  }
})
