export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const originalFetch = globalThis.$fetch
    if (typeof originalFetch === 'function') {
      // @ts-ignore
      globalThis.$fetch = (request: any, opts: any) => {
        const mergedOpts = {
          ...opts,
          onResponseError(context: any) {
            if (context.response?.status === 401) {
              const url = window.location.pathname
              if (url.startsWith('/host')) {
                // Force reload the current host page to trigger Cloudflare Access login redirect
                window.location.reload()
                return
              }
            }
            if (opts?.onResponseError) {
              opts.onResponseError(context)
            }
          }
        }
        return originalFetch(request, mergedOpts)
      }
    }
  }
})
