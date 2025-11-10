/**
 * Configuration Manager
 * 
 * Manages plugin configuration with core overrides.
 * Handles config validation, merging, and runtime updates.
 */

import { PluginManifest, PluginConfiguration } from './types'

export class ConfigManager {
  private configCache: Map<string, any> = new Map()

  /**
   * Load and merge plugin configuration
   * Core configuration always takes precedence over plugin defaults
   */
  async loadConfig(
    manifest: PluginManifest,
    coreConfig: PluginConfiguration
  ): Promise<any> {
    const pluginId = manifest.id

    // Get plugin defaults
    const defaults = manifest.config?.defaults || {}

    // Get core overrides
    const coreOverrides = coreConfig.config || {}

    // Deep merge (core takes precedence)
    const mergedConfig = this.deepMerge(defaults, coreOverrides)

    // Validate against schema if provided
    if (manifest.config?.schema) {
      try {
        const validated = manifest.config.schema.parse(mergedConfig)
        
        // Cache the validated config
        this.configCache.set(pluginId, validated)

        console.log(`[ConfigManager] Loaded config for plugin: ${pluginId}`)
        
        return validated
      } catch (error: any) {
        throw new Error(
          `Configuration validation failed for ${pluginId}: ${error.message}`
        )
      }
    }

    // No schema, just cache the merged config
    this.configCache.set(pluginId, mergedConfig)
    
    return mergedConfig
  }

  /**
   * Get configuration for a plugin
   */
  getConfig<T = any>(pluginId: string): T | undefined {
    return this.configCache.get(pluginId)
  }

  /**
   * Get configuration value by path
   * @example getConfigValue('inventory', 'notifications.lowStockAlert')
   */
  getConfigValue(pluginId: string, path: string): any {
    const config = this.configCache.get(pluginId)
    if (!config) return undefined

    return this.getNestedValue(config, path)
  }

  /**
   * Update configuration at runtime
   */
  async updateConfig(
    pluginId: string,
    updates: Record<string, any>,
    manifest: PluginManifest
  ): Promise<any> {
    const currentConfig = this.configCache.get(pluginId) || {}
    const updatedConfig = this.deepMerge(currentConfig, updates)

    // Validate if schema exists
    if (manifest.config?.schema) {
      try {
        const validated = manifest.config.schema.parse(updatedConfig)
        this.configCache.set(pluginId, validated)

        console.log(`[ConfigManager] Updated config for plugin: ${pluginId}`)

        // Trigger lifecycle hook if available
        if (manifest.lifecycle?.onConfigChange) {
          await manifest.lifecycle.onConfigChange(currentConfig, validated)
        }

        return validated
      } catch (error: any) {
        throw new Error(
          `Configuration validation failed for ${pluginId}: ${error.message}`
        )
      }
    }

    this.configCache.set(pluginId, updatedConfig)
    return updatedConfig
  }

  /**
   * Set specific configuration value
   */
  setConfigValue(pluginId: string, path: string, value: any): void {
    const config = this.configCache.get(pluginId)
    if (!config) {
      throw new Error(`No configuration found for plugin: ${pluginId}`)
    }

    this.setNestedValue(config, path, value)
    console.log(`[ConfigManager] Updated ${pluginId}.${path} = ${value}`)
  }

  /**
   * Check if plugin has specific feature enabled
   */
  isFeatureEnabled(
    pluginId: string,
    featureName: string,
    coreConfig: PluginConfiguration
  ): boolean {
    // Check core feature flags first
    if (coreConfig.features && featureName in coreConfig.features) {
      return coreConfig.features[featureName]
    }

    // Fall back to plugin config
    const config = this.configCache.get(pluginId)
    if (!config || !config.features) return false

    return config.features[featureName] === true
  }

  /**
   * Get all feature flags for a plugin
   */
  getFeatures(
    pluginId: string,
    coreConfig: PluginConfiguration
  ): Record<string, boolean> {
    const pluginFeatures = this.configCache.get(pluginId)?.features || {}
    const coreFeatures = coreConfig.features || {}

    // Core features override plugin features
    return { ...pluginFeatures, ...coreFeatures }
  }

  /**
   * Clear cached configuration
   */
  clearCache(pluginId?: string): void {
    if (pluginId) {
      this.configCache.delete(pluginId)
      console.log(`[ConfigManager] Cleared cache for: ${pluginId}`)
    } else {
      this.configCache.clear()
      console.log('[ConfigManager] Cleared all config cache')
    }
  }

  /**
   * Get all cached configurations
   */
  getAllConfigs(): Record<string, any> {
    const configs: Record<string, any> = {}
    for (const [pluginId, config] of this.configCache) {
      configs[pluginId] = config
    }
    return configs
  }

  /**
   * Deep merge two objects (source takes precedence)
   */
  private deepMerge(target: any, source: any): any {
    if (!source) return target
    if (!target) return source

    const result = { ...target }

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }

    return result
  }

  /**
   * Get nested value from object by dot notation path
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current === null || current === undefined) return undefined
      current = current[key]
    }

    return current
  }

  /**
   * Set nested value in object by dot notation path
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * Export configuration to JSON (for persistence)
   */
  exportConfig(pluginId: string): string {
    const config = this.configCache.get(pluginId)
    if (!config) {
      throw new Error(`No configuration found for plugin: ${pluginId}`)
    }

    return JSON.stringify(config, null, 2)
  }

  /**
   * Import configuration from JSON
   */
  async importConfig(
    pluginId: string,
    json: string,
    manifest: PluginManifest
  ): Promise<any> {
    try {
      const config = JSON.parse(json)
      
      // Validate if schema exists
      if (manifest.config?.schema) {
        const validated = manifest.config.schema.parse(config)
        this.configCache.set(pluginId, validated)
        return validated
      }

      this.configCache.set(pluginId, config)
      return config
    } catch (error: any) {
      throw new Error(`Failed to import configuration: ${error.message}`)
    }
  }
}

