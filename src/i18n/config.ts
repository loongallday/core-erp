import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { SupabaseBackend } from '@/lib/supabaseI18nBackend'
import { logWarn, logDebug } from '@/lib/logger'

// Initialize i18next with Supabase backend
i18n
  .use(SupabaseBackend) // Use Supabase backend to fetch translations
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    fallbackLng: 'en', // Fallback language
    defaultNS: 'common', // Default namespace
    ns: ['common', 'auth', 'users', 'roles'], // Available namespaces
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Disable suspense
    },

    // Backend options
    backend: {
      // Custom backend configuration if needed
    },

    // Show translation keys when translation is missing
    saveMissing: false,
    missingKeyHandler: (_lngs, ns, key, _fallbackValue) => {
      logWarn(`Missing translation: ${ns}:${key}`, { component: 'i18n', namespace: ns, key })
    },
    
    // Return key if translation is missing
    returnNull: false,
    returnEmptyString: false,
    parseMissingKeyHandler: (key) => {
      // Return the key itself when translation is missing
      logDebug(`Showing key for missing translation: ${key}`, { component: 'i18n', key })
      return key
    },
  })

export default i18n

