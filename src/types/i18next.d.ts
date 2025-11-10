import 'i18next'

/**
 * Type declarations for i18next with Supabase backend
 * Since translations are stored in database, we can't statically type them
 * This provides basic typing without strict key checking
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    // Return type for translation function - allows any key
    returnNull: false
    returnEmptyString: false
  }
}

