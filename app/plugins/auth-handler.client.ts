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
                // Prevent infinite reload loops.
                // If we reloaded in the last 15 seconds, don't reload again.
                const lastReload = sessionStorage.getItem('last_auth_reload')
                const now = Date.now()
                if (lastReload && now - parseInt(lastReload, 10) < 15000) {
                  console.error('Authentication reload loop prevented. The page returned 401 twice within 15 seconds.')
                  
                  // Clear the reload timestamp so if they manually refresh or try later, it can try again
                  sessionStorage.removeItem('last_auth_reload')
                  
                  if (opts?.onResponseError) {
                    opts.onResponseError(context)
                  }
                  return
                }
                
                sessionStorage.setItem('last_auth_reload', now.toString())
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
