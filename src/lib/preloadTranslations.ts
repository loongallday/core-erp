import { preloadTranslations } from './supabaseI18nBackend'

/**
 * Preload translations on app startup
 * This improves initial load time by caching all translations
 */
export async function initializeTranslations() {
  const locales = ['en', 'th']
  const namespaces = ['common', 'auth', 'users', 'roles']

  try {
    console.log('[App] Initializing translations...')
    await preloadTranslations(locales, namespaces)
    console.log('[App] Translations initialized successfully')
  } catch (error) {
    console.error('[App] Failed to initialize translations:', error)
    // Continue anyway - translations will load on demand and show keys if they fail
  }
}

