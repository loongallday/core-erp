/**
 * Plugin Loader
 * 
 * Handles dynamic loading and importing of plugin packages.
 * Supports loading from npm packages, git repositories, and local files.
 */

import { logDebug, logInfo, logError } from '../logger'
import { PluginManifest } from './types'

export class PluginLoader {
  private cache: Map<string, PluginManifest> = new Map()

  /**
   * Load a plugin from package name
   */
  async load(packageName: string): Promise<PluginManifest> {
    // Check cache first
    if (this.cache.has(packageName)) {
      logDebug(`Using cached plugin: ${packageName}`, { 
        component: 'PluginLoader',
        packageName 
      })
      return this.cache.get(packageName)!
    }

    logInfo(`Loading plugin: ${packageName}`, { 
      component: 'PluginLoader',
      packageName 
    })

    try {
      // Dynamic import of the plugin package
      const pluginModule = await this.dynamicImport(packageName)

      // Extract manifest
      const manifest = this.extractManifest(pluginModule)

      // Validate manifest structure
      this.validateManifestStructure(manifest)

      // Cache the manifest
      this.cache.set(packageName, manifest)

      logInfo(`Successfully loaded plugin: ${manifest.id}`, { 
        component: 'PluginLoader',
        packageName,
        pluginId: manifest.id 
      })

      return manifest
    } catch (error) {
      logError(`Failed to load plugin ${packageName}`, error as Error, { 
        component: 'PluginLoader',
        packageName 
      })
      throw new Error(`Failed to load plugin ${packageName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Dynamic import with proper error handling
   */
  private async dynamicImport(packageName: string): Promise<any> {
    try {
      console.log('[PluginLoader] Attempting to import:', packageName)
      
      // For scoped packages (@composable-erp/*, @core-erp/*)
      // Try loading from node_modules directly
      if (packageName.startsWith('@composable-erp/') || packageName.startsWith('@core-erp/')) {
        console.log('[PluginLoader] Loading scoped package from node_modules')
        const modulePath = `/node_modules/${packageName}/dist/index.js`
        console.log('[PluginLoader] Trying path:', modulePath)
        return await import(/* @vite-ignore */ modulePath)
      }
      
      // For local relative paths (e.g., ../core-leave/src/index.ts)
      if (packageName.startsWith('../') || packageName.startsWith('./')) {
        console.log('[PluginLoader] Loading from relative path:', packageName)
        return await import(/* @vite-ignore */ packageName)
      }
      
      // For local file paths with file: protocol
      if (packageName.startsWith('file:')) {
        const filePath = packageName.replace('file:', '')
        console.log('[PluginLoader] Loading from file: protocol:', filePath)
        return await import(/* @vite-ignore */ filePath)
      }

      // Default: try as package name
      console.log('[PluginLoader] Loading as package:', packageName)
      return await import(/* @vite-ignore */ packageName)
    } catch (error) {
      console.error('[PluginLoader] Import failed for', packageName, error)
      throw new Error(`Failed to import package: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Extract plugin manifest from module
   */
  private extractManifest(pluginModule: any): PluginManifest {
    // Try different export patterns
    if (pluginModule.plugin) {
      return pluginModule.plugin
    }

    if (pluginModule.default && pluginModule.default.plugin) {
      return pluginModule.default.plugin
    }

    if (pluginModule.default) {
      return pluginModule.default
    }

    throw new Error('Plugin manifest not found. Plugin must export "plugin" or default export.')
  }

  /**
   * Validate basic manifest structure
   */
  private validateManifestStructure(manifest: any): void {
    const required = ['id', 'name', 'version', 'description', 'author', 'category']

    for (const field of required) {
      if (!manifest[field]) {
        throw new Error(`Plugin manifest missing required field: ${field}`)
      }
    }

    // Validate ID format (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(manifest.id)) {
      throw new Error(`Plugin ID must be lowercase alphanumeric with hyphens only: ${manifest.id}`)
    }

    // Validate version format (semver)
    if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
      throw new Error(`Plugin version must be valid semver: ${manifest.version}`)
    }
  }

  /**
   * Preload plugins (for better performance)
   */
  async preload(packageNames: string[]): Promise<void> {
    logInfo(`Preloading ${packageNames.length} plugins...`, { 
      component: 'PluginLoader',
      count: packageNames.length 
    })

    const promises = packageNames.map((name) => this.load(name))
    await Promise.allSettled(promises)

    logInfo('Preload complete', { component: 'PluginLoader' })
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    logDebug('Cache cleared', { component: 'PluginLoader' })
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      packages: Array.from(this.cache.keys()),
    }
  }
}

