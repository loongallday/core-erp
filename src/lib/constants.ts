/**
 * Session Management Constants
 * 
 * Centralized configuration for authentication and session management
 */

/** Session warning thresholds in milliseconds (5 min and 1 min before expiry) */
export const SESSION_WARNING_THRESHOLDS = [5 * 60 * 1000, 1 * 60 * 1000]

/** Activity debounce delay in milliseconds (30 seconds) */
export const ACTIVITY_DEBOUNCE_MS = 30000

/** Session check interval in milliseconds (1 minute) */
export const SESSION_CHECK_INTERVAL_MS = 60000

/** Maximum number of retries for auth operations */
export const MAX_AUTH_RETRIES = 3

/** Base delay for exponential backoff retry in milliseconds */
export const AUTH_RETRY_BASE_DELAY_MS = 1000

/** BroadcastChannel name for cross-tab auth synchronization */
export const AUTH_SYNC_CHANNEL = 'auth-sync'

/** Local storage key for return URL */
export const RETURN_URL_KEY = 'auth_return_url'

/** Activity events to track for session extension */
export const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

