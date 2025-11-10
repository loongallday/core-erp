/**
 * Plugin Registry
 * 
 * Discovers, loads, and manages all plugins in the system.
 * Maintains a central registry of available and loaded plugins.
 */

import { logDebug, logInfo } from '../logger'
import {
  PluginManifest,
  PluginConfiguration,
  LoadedPlugin,
  PluginStatus,
  PluginContext,
} from './types'
import { PluginLoader } from './PluginLoader'
import { PluginValidator } from './PluginValidator'
import { extractPluginId, deepMerge } from './utils'

export class PluginRegistry {
  private plugins: Map<string, LoadedPlugin> = new Map()
  private loader: PluginLoader
  private validator: PluginValidator

  constructor() {
    this.loader = new PluginLoader()
    this.validator = new PluginValidator()
  }

  /**
   * Register a plugin from configuration
   */
  async register(
    config: PluginConfiguration,
    context: PluginContext
  ): Promise<LoadedPlugin> {
    const pluginId = extractPluginId(config.package)

    // Check if already registered
    if (this.plugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already registered`)
    }

    // Load plugin manifest
    const manifest = await this.loader.load(config.package)

    // Validate plugin
    const validation = await this.validator.validate(manifest, config)
    if (!validation.valid) {
      throw new Error(
        `Plugin ${pluginId} validation failed: ${validation.errors
          .map((e) => e.message)
          .join(', ')}`
      )
    }

    // Create loaded plugin entry
    const loadedPlugin: LoadedPlugin = {
      id: manifest.id,
      manifest,
      config: this.mergeConfig(manifest, config),
      enabled: config.enabled,
      status: 'loaded',
      context,
    }

    // Store in registry
    this.plugins.set(manifest.id, loadedPlugin)

    logInfo(`Registered plugin: ${manifest.id}`, { 
      component: 'PluginRegistry',
      pluginId: manifest.id 
    })

    return loadedPlugin
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      return false
    }

    // Call lifecycle hook if available
    if (plugin.manifest.lifecycle?.onUninstall) {
      plugin.manifest.lifecycle.onUninstall(plugin.context)
    }

    this.plugins.delete(pluginId)
    logInfo(`Unregistered plugin: ${pluginId}`, { 
      component: 'PluginRegistry',
      pluginId 
    })

    return true
  }

  /**
   * Get a plugin by ID
   */
  get(pluginId: string): LoadedPlugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * Get all plugins
   */
  getAll(): LoadedPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get enabled plugins only
   */
  getEnabled(): LoadedPlugin[] {
    return this.getAll().filter((p) => p.enabled && p.status === 'enabled')
  }

  /**
   * Get plugins by category
   */
  getByCategory(category: string): LoadedPlugin[] {
    return this.getAll().filter((p) => p.manifest.category === category)
  }

  /**
   * Check if a plugin is registered
   */
  has(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }

  /**
   * Update plugin status
   */
  updateStatus(pluginId: string, status: PluginStatus): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin) {
      plugin.status = status
      logDebug(`Plugin ${pluginId} status: ${status}`, { 
        component: 'PluginRegistry',
        pluginId,
        status 
      })
    }
  }

  /**
   * Merge plugin manifest config with core configuration
   */
  private mergeConfig(
    manifest: PluginManifest,
    coreConfig: PluginConfiguration
  ): any {
    const pluginDefaults = manifest.config?.defaults || {}
    const coreOverrides = coreConfig.config || {}

    // Deep merge: core config takes precedence
    return deepMerge(pluginDefaults, coreOverrides)
  }

  /**
   * Get plugin statistics
   */
  getStats() {
    const all = this.getAll()
    return {
      total: all.length,
      enabled: all.filter((p) => p.enabled).length,
      disabled: all.filter((p) => !p.enabled).length,
      loaded: all.filter((p) => p.status === 'loaded').length,
      error: all.filter((p) => p.status === 'error').length,
      byCategory: this.getPluginsByCategory(),
    }
  }

  /**
   * Group plugins by category
   */
  private getPluginsByCategory(): Record<string, number> {
    const categories: Record<string, number> = {}
    
    for (const plugin of this.getAll()) {
      const cat = plugin.manifest.category
      categories[cat] = (categories[cat] || 0) + 1
    }

    return categories
  }

  /**
   * Clear all plugins (for testing/reset)
   */
  clear(): void {
    this.plugins.clear()
    logDebug('Cleared all plugins', { component: 'PluginRegistry' })
  }
}

