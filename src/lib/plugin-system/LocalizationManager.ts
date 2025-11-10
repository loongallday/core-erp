/**
 * Localization Manager
 * 
 * Manages plugin translations with core overrides.
 * Integrates with existing i18next system.
 */

import i18n from '@/i18n/config'
import { PluginManifest, PluginConfiguration } from './types'

export class LocalizationManager {
  private translationCache: Map<string, Record<string, any>> = new Map()

  /**
   * Load and register plugin translations
   * Core configuration always takes precedence over plugin defaults
   */
  async loadPluginTranslations(
    manifest: PluginManifest,
    coreConfig: PluginConfiguration
  ): Promise<void> {
    const pluginId = manifest.id

    if (!manifest.translations) {
      console.log(`[LocalizationManager] Plugin ${pluginId} has no translations`)
      return
    }

    console.log(`[LocalizationManager] Loading translations for plugin: ${pluginId}`)

    // Get supported locales
    const namespaces = manifest.translations.namespaces || []
    const supportedLocales = ['en', 'th'] // TODO: Get from core config

    for (const locale of supportedLocales) {
      for (const namespace of namespaces) {
        try {
          // 1. Load plugin default translations
          const pluginDefaults = await this.loadPluginDefaults(manifest, locale, namespace)

          // 2. Get core overrides from plugins.config.ts
          const coreOverrides = this.getCoreOverrides(coreConfig, locale, namespace)

          // 3. Merge (core takes precedence)
          const mergedTranslations = this.deepMerge(pluginDefaults, coreOverrides)

          // 4. Cache translations
          const cacheKey = `${pluginId}:${locale}:${namespace}`
          this.translationCache.set(cacheKey, mergedTranslations)

          // 5. Register with i18next
          await this.registerWithI18next(locale, namespace, mergedTranslations)

          console.log(
            `[LocalizationManager] Loaded ${locale}/${namespace} for ${pluginId}`
          )
        } catch (error) {
          console.error(
            `[LocalizationManager] Failed to load ${locale}/${namespace} for ${pluginId}:`,
            error
          )
        }
      }
    }
  }

  /**
   * Load plugin default translations
   */
  private async loadPluginDefaults(
    manifest: PluginManifest,
    locale: string,
    namespace: string
  ): Promise<Record<string, any>> {
    if (!manifest.translations?.defaults[locale]) {
      return {}
    }

    try {
      const loaders = manifest.translations.defaults[locale]
      const loader = loaders[namespace]

      if (!loader) {
        return {}
      }

      const module = await loader()
      return module.default || module
    } catch (error) {
      console.warn(
        `[LocalizationManager] Failed to load plugin default translations:`,
        error
      )
      return {}
    }
  }

  /**
   * Get core translation overrides from config
   */
  private getCoreOverrides(
    coreConfig: PluginConfiguration,
    locale: string,
    namespace: string
  ): Record<string, any> {
    if (!coreConfig.localization || !coreConfig.localization[locale]) {
      return {}
    }

    const localeOverrides = coreConfig.localization[locale]

    // Filter overrides for this namespace
    const namespaceOverrides: Record<string, any> = {}

    for (const [key, value] of Object.entries(localeOverrides)) {
      // Keys should be in format: namespace.key.subkey
      if (key.startsWith(`${namespace}.`)) {
        // Remove namespace prefix
        const cleanKey = key.substring(namespace.length + 1)
        this.setNestedValue(namespaceOverrides, cleanKey, value)
      }
    }

    return namespaceOverrides
  }

  /**
   * Register translations with i18next
   */
  private async registerWithI18next(
    locale: string,
    namespace: string,
    translations: Record<string, any>
  ): Promise<void> {
    try {
      // Add resource bundle to i18next
      i18n.addResourceBundle(
        locale,
        namespace,
        translations,
        true, // deep merge
        true  // overwrite existing
      )
    } catch (error) {
      console.error(
        `[LocalizationManager] Failed to register with i18next:`,
        error
      )
    }
  }

  /**
   * Get translation for a plugin
   */
  getTranslation(
    pluginId: string,
    locale: string,
    namespace: string,
    key: string
  ): string | undefined {
    const cacheKey = `${pluginId}:${locale}:${namespace}`
    const translations = this.translationCache.get(cacheKey)

    if (!translations) {
      return undefined
    }

    return this.getNestedValue(translations, key)
  }

  /**
   * Check if translations are loaded for a plugin
   */
  hasTranslations(pluginId: string, locale: string, namespace: string): boolean {
    const cacheKey = `${pluginId}:${locale}:${namespace}`
    return this.translationCache.has(cacheKey)
  }

  /**
   * Get all translation keys for a namespace
   */
  getTranslationKeys(
    pluginId: string,
    locale: string,
    namespace: string
  ): string[] {
    const cacheKey = `${pluginId}:${locale}:${namespace}`
    const translations = this.translationCache.get(cacheKey)

    if (!translations) {
      return []
    }

    return this.extractKeys(translations)
  }

  /**
   * Update translation at runtime (for testing/debugging)
   */
  updateTranslation(
    pluginId: string,
    locale: string,
    namespace: string,
    key: string,
    value: string
  ): void {
    const cacheKey = `${pluginId}:${locale}:${namespace}`
    const translations = this.translationCache.get(cacheKey) || {}

    this.setNestedValue(translations, key, value)
    this.translationCache.set(cacheKey, translations)

    // Update i18next
    i18n.addResourceBundle(locale, namespace, translations, true, true)

    console.log(`[LocalizationManager] Updated ${cacheKey}.${key}`)
  }

  /**
   * Clear translation cache
   */
  clearCache(pluginId?: string): void {
    if (pluginId) {
      // Clear all entries for this plugin
      const keysToDelete: string[] = []
      for (const key of this.translationCache.keys()) {
        if (key.startsWith(`${pluginId}:`)) {
          keysToDelete.push(key)
        }
      }
      keysToDelete.forEach(key => this.translationCache.delete(key))
      console.log(`[LocalizationManager] Cleared cache for: ${pluginId}`)
    } else {
      this.translationCache.clear()
      console.log('[LocalizationManager] Cleared all translation cache')
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats: Record<string, any> = {
      totalEntries: this.translationCache.size,
      byPlugin: {},
    }

    for (const key of this.translationCache.keys()) {
      const pluginId = key.split(':')[0]
      stats.byPlugin[pluginId] = (stats.byPlugin[pluginId] || 0) + 1
    }

    return stats
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
   * Get nested value from object by dot notation
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
   * Set nested value in object by dot notation
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
   * Extract all keys from nested object
   */
  private extractKeys(obj: any, prefix: string = ''): string[] {
    const keys: string[] = []

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        keys.push(...this.extractKeys(value, fullKey))
      } else {
        keys.push(fullKey)
      }
    }

    return keys
  }

  /**
   * Export translations to JSON (for backup/debugging)
   */
  exportTranslations(pluginId: string, locale: string, namespace: string): string {
    const cacheKey = `${pluginId}:${locale}:${namespace}`
    const translations = this.translationCache.get(cacheKey)

    if (!translations) {
      throw new Error(`No translations found for ${cacheKey}`)
    }

    return JSON.stringify(translations, null, 2)
  }

  /**
   * Import translations from JSON
   */
  importTranslations(
    pluginId: string,
    locale: string,
    namespace: string,
    json: string
  ): void {
    try {
      const translations = JSON.parse(json)
      const cacheKey = `${pluginId}:${locale}:${namespace}`

      this.translationCache.set(cacheKey, translations)
      i18n.addResourceBundle(locale, namespace, translations, true, true)

      console.log(`[LocalizationManager] Imported translations for ${cacheKey}`)
    } catch (error: any) {
      throw new Error(`Failed to import translations: ${error.message}`)
    }
  }
}

