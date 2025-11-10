import { preloadTranslations } from './supabaseI18nBackend'
import { logInfo, logError, logWarn, logDebug } from './logger'

// Guard to prevent multiple simultaneous initializations
let isInitializing = false
let hasInitialized = false

/**
 * Preload translations on app startup with timeout
 * This improves initial load time by caching all translations
 * If loading takes too long, app will render with on-demand translation loading
 */
export async function initializeTranslations() {
  logDebug('initializeTranslations called', { component: 'Translations' })
  
  // Prevent multiple initialization calls
  if (hasInitialized || isInitializing) {
    logInfo('Translations already initialized or initializing', { 
      component: 'Translations',
      hasInitialized,
      isInitializing 
    })
    return
  }

  isInitializing = true
  const locales = ['en', 'th']
  const namespaces = ['common', 'auth', 'users', 'roles']
  const TIMEOUT_MS = 5000 // 5 second timeout

  logInfo('Initializing translations...', { 
    component: 'Translations',
    locales,
    namespaces,
    timeout: TIMEOUT_MS 
  })

  try {
    // Race between translation loading and timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Translation loading timeout'))
      }, TIMEOUT_MS)
    })
    
    const preloadPromise = preloadTranslations(locales, namespaces)
    await Promise.race([preloadPromise, timeoutPromise])
    
    logInfo('Translations initialized successfully', { component: 'Translations' })
    hasInitialized = true
  } catch (error) {
    if (error instanceof Error && error.message === 'Translation loading timeout') {
      logWarn('Translation loading timed out, will load on demand', { 
        component: 'Translations',
        timeout: TIMEOUT_MS 
      })
    } else {
      logError('Failed to initialize translations', error as Error, { 
        component: 'Translations' 
      })
    }
    // Continue anyway - translations will load on demand and show keys if they fail
    hasInitialized = true
  } finally {
    isInitializing = false
    logDebug('Initialization complete', { 
      component: 'Translations',
      hasInitialized 
    })
  }
}

