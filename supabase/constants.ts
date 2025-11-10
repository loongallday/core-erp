/**
 * System Configuration - Database-backed constants
 * 
 * This module provides type-safe access to system configuration stored in Supabase.
 * Constants are fetched from the system_config table and cached for performance.
 */

import { supabase } from '../src/lib/supabase'
import { logWarn, logError, logDebug } from '../src/lib/logger'

// Type definitions for system config
export interface SystemConfig {
  SESSION_WARNING_THRESHOLDS: number[]
  ACTIVITY_DEBOUNCE_MS: number
  SESSION_CHECK_INTERVAL_MS: number
  MAX_AUTH_RETRIES: number
  AUTH_RETRY_BASE_DELAY_MS: number
  AUTH_SYNC_CHANNEL: string
  RETURN_URL_KEY: string
  ACTIVITY_EVENTS: readonly string[]
}

// Database row type
export interface SystemConfigRow {
  id: string
  key: string
  value: any
  description: string | null
  category: string | null
  is_system: boolean
  created_at: string
  updated_at: string
}

// Default fallback values (in case database is unavailable)
const DEFAULT_CONFIG: SystemConfig = {
  SESSION_WARNING_THRESHOLDS: [5 * 60 * 1000, 1 * 60 * 1000],
  ACTIVITY_DEBOUNCE_MS: 30000,
  SESSION_CHECK_INTERVAL_MS: 60000,
  MAX_AUTH_RETRIES: 3,
  AUTH_RETRY_BASE_DELAY_MS: 1000,
  AUTH_SYNC_CHANNEL: 'auth-sync',
  RETURN_URL_KEY: 'auth_return_url',
  ACTIVITY_EVENTS: ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const,
}

// Cache for system config
let configCache: SystemConfig | null = null
let lastFetchTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Fetch system configuration from database
 * Results are cached for 5 minutes to reduce database queries
 */
export async function getSystemConfig(): Promise<SystemConfig> {
  const now = Date.now()
  
  // Return cached config if still valid
  if (configCache && (now - lastFetchTime) < CACHE_TTL) {
    logDebug('Using cached system config', { 
      cacheAge: now - lastFetchTime,
      ttl: CACHE_TTL 
    })
    return configCache
  }

  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('key, value')
      .in('key', Object.keys(DEFAULT_CONFIG))

    if (error) {
      logError('Failed to fetch system config, using defaults', error, {
        component: 'SystemConfig',
        action: 'getSystemConfig'
      })
      return DEFAULT_CONFIG
    }

    if (!data || data.length === 0) {
      logWarn('No system config found in database, using defaults', {
        component: 'SystemConfig',
        action: 'getSystemConfig'
      })
      return DEFAULT_CONFIG
    }

    // Build config object from database results
    const config: SystemConfig = { ...DEFAULT_CONFIG }
    for (const item of data as Array<{ key: string; value: any }>) {
      if (item.key && item.key in DEFAULT_CONFIG) {
        (config as any)[item.key] = item.value
      }
    }

    configCache = config
    lastFetchTime = now

    logDebug('System config loaded from database', {
      component: 'SystemConfig',
      keysLoaded: data.length
    })

    return config
  } catch (err) {
    logError('Unexpected error fetching system config, using defaults', err as Error, {
      component: 'SystemConfig',
      action: 'getSystemConfig'
    })
    return DEFAULT_CONFIG
  }
}

/**
 * Get a specific config value by key
 */
export async function getConfigValue<K extends keyof SystemConfig>(
  key: K
): Promise<SystemConfig[K]> {
  const config = await getSystemConfig()
  return config[key]
}

/**
 * Clear the config cache (useful for testing or after config updates)
 */
export function clearConfigCache(): void {
  configCache = null
  lastFetchTime = 0
  
  logDebug('System config cache cleared', {
    component: 'SystemConfig',
    action: 'clearConfigCache'
  })
}

/**
 * Synchronous access to config (uses cache only, returns defaults if not cached)
 * Use this only after getSystemConfig() has been called at least once
 */
export function getSystemConfigSync(): SystemConfig {
  return configCache || DEFAULT_CONFIG
}

// Export individual constants for backward compatibility
// These are synchronous getters that use cached values
export const SESSION_WARNING_THRESHOLDS = () => getSystemConfigSync().SESSION_WARNING_THRESHOLDS
export const ACTIVITY_DEBOUNCE_MS = () => getSystemConfigSync().ACTIVITY_DEBOUNCE_MS
export const SESSION_CHECK_INTERVAL_MS = () => getSystemConfigSync().SESSION_CHECK_INTERVAL_MS
export const MAX_AUTH_RETRIES = () => getSystemConfigSync().MAX_AUTH_RETRIES
export const AUTH_RETRY_BASE_DELAY_MS = () => getSystemConfigSync().AUTH_RETRY_BASE_DELAY_MS
export const AUTH_SYNC_CHANNEL = () => getSystemConfigSync().AUTH_SYNC_CHANNEL
export const RETURN_URL_KEY = () => getSystemConfigSync().RETURN_URL_KEY
export const ACTIVITY_EVENTS = () => getSystemConfigSync().ACTIVITY_EVENTS

// Pre-load config on module initialization
getSystemConfig().catch((err) => {
  logError('Failed to pre-load system config', err, {
    component: 'SystemConfig',
    action: 'moduleInit'
  })
})

/**
 * React Query Hooks
 * 
 * For React components, use the hooks in src/hooks/useSystemConfig.ts:
 * - useSystemConfig() - Get all config with React Query
 * - useSystemConfigValue(key) - Get specific config value
 * - useUpdateSystemConfig() - Update config (requires system:configure permission)
 * - useSystemConfigAdmin() - Get all config with metadata (for admin UI)
 * - useBulkUpdateSystemConfig() - Update multiple config values
 */
