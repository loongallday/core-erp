/**
 * Plugin System - Main Exports
 * 
 * Central export point for all plugin system modules.
 * Import plugin system components from this file.
 */

// Core Types
export * from './types'

// Core Classes
export { PluginManager, getPluginManager, resetPluginManager } from './PluginManager'
export { PluginRegistry } from './PluginRegistry'
export { PluginLoader } from './PluginLoader'
export { PluginValidator } from './PluginValidator'
export { DependencyResolver } from './DependencyResolver'
export { ConfigManager } from './ConfigManager'
export { EventBus } from './EventBus'
export { HookRegistry } from './HookRegistry'

// React Context
export { PluginProvider } from './context/PluginContext'
export { usePluginContext } from './hooks/usePluginContext'

// React Hooks
export * from './hooks'

/**
 * Initialize the plugin system
 * 
 * @example
 * ```typescript
 * import { getPluginManager } from '@/lib/plugin-system'
 * import pluginConfig from '@/plugins.config'
 * 
 * const pluginManager = getPluginManager()
 * await pluginManager.initialize(pluginConfig)
 * ```
 */
export async function initializePluginSystem() {
  const { getPluginManager } = await import('./PluginManager')
  const config = await import('../../../plugins.config')
  
  const manager = getPluginManager()
  await manager.initialize(config.default)
  
  return manager
}

/**
 * Check if plugin system is available
 */
export function isPluginSystemAvailable(): boolean {
  try {
    const { getPluginManager } = require('./PluginManager')
    return getPluginManager() !== null
  } catch {
    return false
  }
}

