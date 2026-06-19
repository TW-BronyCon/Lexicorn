// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-06-19',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'Storyteller - Taiwan BronyCon Interactive Story Game',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ]
    }
  }
})
