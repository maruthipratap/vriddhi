import i18n           from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en/translation.json'
import hi from './locales/hi/translation.json'
import te from './locales/te/translation.json'
import kn from './locales/kn/translation.json'

i18n
  .use(LanguageDetector)   // detect from browser / localStorage
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      te: { translation: te },
      kn: { translation: kn },
    },
    fallbackLng:    'en',
    supportedLngs:  ['en', 'hi', 'te', 'kn'],
    interpolation:  { escapeValue: false },   // React handles XSS
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'vriddhi_lang',
    },
  })

export default i18n

// ── Available languages (for the switcher UI) ─────────────────
export const LANGUAGES = [
  { code: 'en', label: 'English',  native: 'English'  },
  { code: 'hi', label: 'Hindi',    native: 'हिंदी'    },
  { code: 'te', label: 'Telugu',   native: 'తెలుగు'   },
  { code: 'kn', label: 'Kannada',  native: 'ಕನ್ನಡ'   },
]
