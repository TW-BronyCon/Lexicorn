import { useI18n, type Locale } from '../composables/useI18n'

export default defineNuxtPlugin((nuxtApp) => {
  const { setLocale } = useI18n()
  
  if (process.client) {
    const saved = localStorage.getItem('user-locale') as Locale
    if (saved && ['en', 'zh-TW', 'zh-CN'].includes(saved)) {
      setLocale(saved)
    } else {
      // Auto detect navigator language
      const lang = navigator.language
      if (lang) {
        const lowerLang = lang.toLowerCase()
        let detected: Locale = 'en'
        if (lowerLang.includes('zh-tw') || lowerLang.includes('zh-hk') || lowerLang.includes('zh-hant')) {
          detected = 'zh-TW'
        } else if (lowerLang.includes('zh')) {
          detected = 'zh-CN'
        }
        setLocale(detected)
      }
    }
  }
})
