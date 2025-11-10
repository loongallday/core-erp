import { BackendModule, ReadCallback } from 'i18next'
import { supabase } from './supabase'

interface Translation {
  locale: string
  namespace: string
  key: string
  value: string
}

// Cache for translations to avoid repeated database calls
const translationCache: Record<string, Record<string, any>> = {}

/**
 * Custom i18next backend that fetches translations from Supabase
 * Falls back to showing translation keys when translations fail to load
 */
export class SupabaseBackend implements BackendModule<object> {
  static type = 'backend' as const
  type = 'backend' as const

  init() {
    // Initialization if needed
  }

  /**
   * Read translations from Supabase for a given language and namespace
   */
  async read(language: string, namespace: string, callback: ReadCallback) {
    const cacheKey = `${language}:${namespace}`

    try {
      // Check cache first
      if (translationCache[cacheKey]) {
        console.log(`[i18n] Using cached translations for ${cacheKey}`)
        callback(null, translationCache[cacheKey])
        return
      }

      console.log(`[i18n] Fetching translations for ${language}:${namespace}`)

      // Fetch translations from Supabase
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('locale', language)
        .eq('namespace', namespace)

      if (error) {
        console.error(`[i18n] Error fetching translations for ${cacheKey}:`, error)
        callback(error, false)
        return
      }

      if (!data || data.length === 0) {
        console.warn(`[i18n] No translations found for ${cacheKey}`)
        callback(null, {}) // Return empty object, will show keys
        return
      }

      // Convert flat array to nested object structure
      const translations = this.convertToNestedObject(data)
      
      // Cache the translations
      translationCache[cacheKey] = translations

      console.log(`[i18n] Loaded ${data.length} translations for ${cacheKey}`)
      callback(null, translations)
    } catch (error) {
      console.error(`[i18n] Unexpected error loading ${cacheKey}:`, error)
      callback(error as Error, false)
    }
  }

  /**
   * Convert flat key-value pairs to nested object
   * Example: 'actions.save' => { actions: { save: 'Save' } }
   */
  private convertToNestedObject(data: Translation[]): Record<string, any> {
    const result: Record<string, any> = {}

    for (const item of data) {
      const keys = item.key.split('.')
      let current = result

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        
        if (i === keys.length - 1) {
          // Last key, set the value
          current[key] = item.value
        } else {
          // Create nested object if it doesn't exist
          if (!current[key]) {
            current[key] = {}
          }
          current = current[key]
        }
      }
    }

    return result
  }

  /**
   * Create a new instance of the backend
   */
  create(): BackendModule<object> {
    return new SupabaseBackend()
  }
}

/**
 * Clear the translation cache
 * Useful for forcing a refresh of translations
 */
export function clearTranslationCache() {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key]
  })
  console.log('[i18n] Translation cache cleared')
}

/**
 * Preload translations for all supported locales and namespaces
 * Call this on app startup for better performance
 */
export async function preloadTranslations(
  locales: string[],
  namespaces: string[]
): Promise<void> {
  console.log('[i18n] Preloading translations...')
  
  const promises: Promise<void>[] = []

  for (const locale of locales) {
    for (const namespace of namespaces) {
      const promise = new Promise<void>((resolve) => {
        const backend = new SupabaseBackend()
        backend.read(locale, namespace, (error, _data) => {
          if (error) {
            console.error(`[i18n] Failed to preload ${locale}:${namespace}`, error)
          }
          resolve()
        })
      })
      promises.push(promise)
    }
  }

  await Promise.all(promises)
  console.log('[i18n] Translation preloading complete')
}

