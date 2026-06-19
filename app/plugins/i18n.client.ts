import { useI18n, type Locale } from '../composables/useI18n'

export default defineNuxtPlugin((nuxtApp) => {
  const { locale } = useI18n()
  
  if (process.client) {
    const saved = localStorage.getItem('user-locale') as Locale
    if (saved && ['en', 'zh-TW', 'zh-CN'].includes(saved)) {
      locale.value = saved
    } else {
      // Auto detect navigator language
      const lang = navigator.language
      if (lang) {
        const lowerLang = lang.toLowerCase()
        if (lowerLang.includes('zh-tw') || lowerLang.includes('zh-hk') || lowerLang.includes('zh-hant')) {
          locale.value = 'zh-TW'
        } else if (lowerLang.includes('zh')) {
          locale.value = 'zh-CN'
        } else {
          locale.value = 'en'
        }
      }
    }
    document.documentElement.lang = locale.value.toLowerCase()
  }
})
