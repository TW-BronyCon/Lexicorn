import { useState, useCookie } from '#app'
import en from '../locales/en.json'
import zhTW from '../locales/zh-TW.json'
import zhCN from '../locales/zh-CN.json'

const LOCALES = ['en', 'zh-TW', 'zh-CN'] as const
export type Locale = typeof LOCALES[number]

export const translations: Record<Locale, Record<string, string>> = {
  en,
  'zh-TW': zhTW,
  'zh-CN': zhCN
}

export const useI18n = () => {
  const localeCookie = useCookie<Locale>('user-locale', { maxAge: 365 * 24 * 60 * 60 })
  const locale = useState<Locale>('locale', () => localeCookie.value || 'en')

  const setLocale = (newLocale: Locale) => {
    if (LOCALES.includes(newLocale)) {
      locale.value = newLocale
      localeCookie.value = newLocale
      if (process.client) {
        localStorage.setItem('user-locale', newLocale)
        document.documentElement.lang = newLocale.toLowerCase()
      }
    }
  }

  const t = (key: string, variables?: Record<string, string | number>) => {
    const translation = translations[locale.value]?.[key] || translations['en']?.[key] || key
    if (!variables) return translation
    return Object.entries(variables).reduce((acc, [k, v]) => {
      return acc.replace(new RegExp(`{${k}}`, 'g'), String(v))
    }, translation)
  }

  return {
    locale,
    setLocale,
    t,
    locales: LOCALES
  }
}
