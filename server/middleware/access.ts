export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  const isHostRoute = url.pathname.startsWith('/host')
  const isTemplatesApi = url.pathname.startsWith('/api/templates')

  // Public/viewer session endpoint: GET /api/sessions/[id] (no sub-paths like /update, /reset, /force)
  const isViewerSessionApi =
    event.method === 'GET' &&
    url.pathname.startsWith('/api/sessions/') &&
    !url.pathname.slice(14).includes('/') &&
    url.pathname !== '/api/sessions/expired'

  const isProtectedSessionApi = url.pathname.startsWith('/api/sessions') && !isViewerSessionApi

  // Only protect host management panels and template/session APIs in production environments
  if (process.env.NODE_ENV === 'production' && (isHostRoute || isTemplatesApi || isProtectedSessionApi)) {
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

