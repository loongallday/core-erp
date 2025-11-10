/**
 * Plugin Manager
 * 
 * Central orchestrator for the plugin system.
 * Manages plugin lifecycle, configuration, and integration with core system.
 */

import { logDebug, logInfo, logWarn, logError } from '../logger'
import {
  PluginsConfiguration,
  PluginConfiguration,
  LoadedPlugin,
  PluginContext,
  PluginLogger,
  PluginRoute,
  PluginMenuItem,
  PluginWidget,
  PluginPermission,
} from './types'
import { PluginRegistry } from './PluginRegistry'
import { PluginLoader } from './PluginLoader'
import { DependencyResolver } from './DependencyResolver'
import { ConfigManager } from './ConfigManager'
import { LocalizationManager } from './LocalizationManager'
import { EventBus } from './EventBus'
import { HookRegistry } from './HookRegistry'
import { extractPluginId } from './utils'

export class PluginManager {
  private registry: PluginRegistry
  private loader: PluginLoader
  private dependencyResolver: DependencyResolver
  private configManager: ConfigManager
  private localizationManager: LocalizationManager
  private eventBus: EventBus
  private hookRegistry: HookRegistry
  
  private configuration: PluginsConfiguration | null = null
  private initialized: boolean = false

  constructor() {
    this.registry = new PluginRegistry()
    this.loader = new PluginLoader()
    this.dependencyResolver = new DependencyResolver()
    this.configManager = new ConfigManager()
    this.localizationManager = new LocalizationManager()
    this.eventBus = new EventBus()
    this.hookRegistry = new HookRegistry()

    logInfo('Plugin system initialized', { component: 'PluginManager' })
  }

  /**
   * Initialize the plugin system with configuration
   */
  async initialize(config: PluginsConfiguration): Promise<void> {
    if (this.initialized) {
      // Already initialized (React StrictMode may call this twice)
      return
    }

    logInfo('Starting initialization...', { component: 'PluginManager' })
    this.configuration = config

    try {
      // 1. Load plugins from configuration
      const enabledPlugins = config.plugins.filter(p => p.enabled)
      logInfo(`Loading ${enabledPlugins.length} enabled plugins...`, { component: 'PluginManager', count: enabledPlugins.length })

      for (const pluginConfig of enabledPlugins) {
        await this.loadPlugin(pluginConfig)
      }

      // 2. Resolve dependencies and determine load order
      const loadOrder = this.dependencyResolver.resolve(
        new Map(Array.from(this.registry.getAll().map(p => [p.id, p])))
      )
      logDebug(`Load order: ${loadOrder.join(' → ')}`, { component: 'PluginManager', loadOrder })

      // 3. Enable plugins in correct order
      for (const pluginId of loadOrder) {
        await this.enablePlugin(pluginId)
      }

      this.initialized = true
      logInfo('Initialization complete', { 
        component: 'PluginManager',
        pluginCount: this.registry.getAll().length,
        enabledCount: this.registry.getEnabled().length
      })

      // Emit initialization complete event
      this.eventBus.emit('plugin-system:initialized', {
        pluginCount: this.registry.getAll().length,
        enabledCount: this.registry.getEnabled().length,
      })
    } catch (error) {
      logError('Initialization failed', error as Error, { component: 'PluginManager' })
      throw error
    }
  }

  /**
   * Load a single plugin
   */
  private async loadPlugin(config: PluginConfiguration): Promise<void> {
    try {
      logInfo(`Loading plugin: ${config.package}`, { component: 'PluginManager', package: config.package })

      // Create plugin context
      const context = this.createPluginContext(config.package)

      // Register the plugin
      const loadedPlugin = await this.registry.register(config, context)

      // Load and validate configuration
      await this.configManager.loadConfig(loadedPlugin.manifest, config)

      // Load plugin translations
      await this.localizationManager.loadPluginTranslations(loadedPlugin.manifest, config)

      logInfo(`Plugin loaded: ${loadedPlugin.id}`, { component: 'PluginManager', pluginId: loadedPlugin.id })
    } catch (error) {
      logError(`Failed to load plugin ${config.package}`, error as Error, { component: 'PluginManager', package: config.package })
      throw error
    }
  }

  /**
   * Enable a plugin
   */
  private async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`)
    }

    try {
      logInfo(`Enabling plugin: ${pluginId}`, { component: 'PluginManager', pluginId })

      // Update status
      this.registry.updateStatus(pluginId, 'loading')

      // Call beforeStart lifecycle hook
      if (plugin.manifest.lifecycle?.beforeStart) {
        await plugin.manifest.lifecycle.beforeStart(plugin.context)
      }

      // Load plugin capabilities
      await this.loadPluginCapabilities(plugin)

      // Call onEnable lifecycle hook
      if (plugin.manifest.lifecycle?.onEnable) {
        await plugin.manifest.lifecycle.onEnable(plugin.context)
      }

      // Update status
      this.registry.updateStatus(pluginId, 'enabled')

      // Call afterStart lifecycle hook
      if (plugin.manifest.lifecycle?.afterStart) {
        await plugin.manifest.lifecycle.afterStart(plugin.context)
      }

      logInfo(`Plugin enabled: ${pluginId}`, { component: 'PluginManager', pluginId })

      // Emit event
      this.eventBus.emit('plugin:enabled', pluginId)
    } catch (error) {
      logError(`Failed to enable plugin ${pluginId}`, error as Error, { component: 'PluginManager', pluginId })
      this.registry.updateStatus(pluginId, 'error')
      throw error
    }
  }

  /**
   * Load plugin capabilities (routes, menus, widgets, etc.)
   */
  private async loadPluginCapabilities(plugin: LoadedPlugin): Promise<void> {
    const { manifest } = plugin

    // Load frontend routes
    if (manifest.frontend?.routes) {
      try {
        const routesModule = await manifest.frontend.routes()
        plugin.routes = routesModule.default
        logDebug(`Loaded ${plugin.routes.length} routes for ${plugin.id}`, { component: 'PluginManager', pluginId: plugin.id, count: plugin.routes.length })
      } catch (error) {
        logError(`Failed to load routes for ${plugin.id}`, error as Error, { component: 'PluginManager', pluginId: plugin.id })
      }
    }

    // Load menu items
    if (manifest.frontend?.menu) {
      try {
        const menuModule = await manifest.frontend.menu()
        plugin.menuItems = menuModule.default
        logDebug(`Loaded ${plugin.menuItems.length} menu items for ${plugin.id}`, { component: 'PluginManager', pluginId: plugin.id, count: plugin.menuItems.length })
      } catch (error) {
        logError(`Failed to load menu for ${plugin.id}`, error as Error, { component: 'PluginManager', pluginId: plugin.id })
      }
    }

    // Load widgets
    if (manifest.frontend?.widgets) {
      try {
        const widgetsModule = await manifest.frontend.widgets()
        plugin.widgets = widgetsModule.default
        logDebug(`Loaded ${plugin.widgets.length} widgets for ${plugin.id}`, { component: 'PluginManager', pluginId: plugin.id, count: plugin.widgets.length })
      } catch (error) {
        logError(`Failed to load widgets for ${plugin.id}`, error as Error, { component: 'PluginManager', pluginId: plugin.id })
      }
    }

    // Load permissions
    if (manifest.permissions) {
      try {
        const permissionsModule = await manifest.permissions()
        plugin.permissions = permissionsModule.default
        logDebug(`Loaded ${plugin.permissions.length} permissions for ${plugin.id}`, { component: 'PluginManager', pluginId: plugin.id, count: plugin.permissions.length })
      } catch (error) {
        logError(`Failed to load permissions for ${plugin.id}`, error as Error, { component: 'PluginManager', pluginId: plugin.id })
      }
    }

    // Register event listeners
    if (manifest.events?.listens) {
      for (const [eventName, handlerLoader] of Object.entries(manifest.events.listens)) {
        try {
          const handlerModule = await handlerLoader()
          this.eventBus.on(eventName, handlerModule.default)
          logDebug(`Registered event listener for ${eventName}`, { component: 'PluginManager', eventName })
        } catch (error) {
          logError(`Failed to register event listener for ${eventName}`, error as Error, { component: 'PluginManager', eventName })
        }
      }
    }
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`)
    }

    try {
      logInfo(`Disabling plugin: ${pluginId}`, { component: 'PluginManager', pluginId })

      // Call onDisable lifecycle hook
      if (plugin.manifest.lifecycle?.onDisable) {
        await plugin.manifest.lifecycle.onDisable(plugin.context)
      }

      // Update status
      this.registry.updateStatus(pluginId, 'disabled')
      plugin.enabled = false

      logInfo(`Plugin disabled: ${pluginId}`, { component: 'PluginManager', pluginId })

      // Emit event
      this.eventBus.emit('plugin:disabled', pluginId)
    } catch (error) {
      logError(`Failed to disable plugin ${pluginId}`, error as Error, { component: 'PluginManager', pluginId })
      throw error
    }
  }

  /**
   * Generic method to collect items from enabled plugins
   */
  private collectFromPlugins<T>(
    propertyName: keyof LoadedPlugin,
    sortFn?: (a: T, b: T) => number
  ): T[] {
    const items: T[] = []
    
    for (const plugin of this.registry.getEnabled()) {
      const pluginItems = plugin[propertyName] as T[] | undefined
      if (pluginItems) {
        items.push(...pluginItems)
      }
    }

    return sortFn ? items.sort(sortFn) : items
  }

  /**
   * Get all plugin routes
   */
  getRoutes(): PluginRoute[] {
    return this.collectFromPlugins<PluginRoute>('routes')
  }

  /**
   * Get all plugin menu items (sorted by order)
   */
  getMenuItems(): PluginMenuItem[] {
    return this.collectFromPlugins<PluginMenuItem>(
      'menuItems',
      (a, b) => (a.order || 0) - (b.order || 0)
    )
  }

  /**
   * Get all plugin widgets
   */
  getWidgets(): PluginWidget[] {
    return this.collectFromPlugins<PluginWidget>('widgets')
  }

  /**
   * Get all plugin permissions
   */
  getPermissions(): PluginPermission[] {
    return this.collectFromPlugins<PluginPermission>('permissions')
  }

  /**
   * Get plugin configuration
   */
  getPluginConfig<T = any>(pluginId: string): T | undefined {
    return this.configManager.getConfig<T>(pluginId)
  }

  /**
   * Update plugin configuration
   */
  async updatePluginConfig(pluginId: string, updates: Record<string, any>): Promise<void> {
    const plugin = this.registry.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`)
    }

    await this.configManager.updateConfig(pluginId, updates, plugin.manifest)
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(pluginId: string, featureName: string): boolean {
    const pluginConfig = this.configuration?.plugins.find(p => {
      const id = this.registry.get(pluginId)?.id
      return p.package.includes(id || '')
    })

    if (!pluginConfig) return false

    return this.configManager.isFeatureEnabled(pluginId, featureName, pluginConfig)
  }

  /**
   * Emit an event
   */
  emit(eventName: string, data: any): void {
    this.eventBus.emit(eventName, data)
  }

  /**
   * Listen to an event
   */
  on(eventName: string, handler: (data: any) => void): void {
    this.eventBus.on(eventName, handler)
  }

  /**
   * Register a hook
   */
  registerHook(hookName: string, callback: Function): void {
    this.hookRegistry.register(hookName, callback)
  }

  /**
   * Execute a hook
   */
  async executeHook(hookName: string, ...args: any[]): Promise<any> {
    return await this.hookRegistry.execute(hookName, ...args)
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): LoadedPlugin[] {
    return Array.from(this.registry.getAll())
  }

  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): LoadedPlugin[] {
    return Array.from(this.registry.getEnabled())
  }

  /**
   * Get disabled plugins
   */
  getDisabledPlugins(): LoadedPlugin[] {
    return Array.from(this.registry.getAll()).filter(p => !p.enabled)
  }

  /**
   * Get a specific plugin by ID
   */
  getPlugin(pluginId: string): LoadedPlugin | undefined {
    return this.registry.get(pluginId)
  }

  /**
   * Get plugin registry
   */
  getRegistry(): PluginRegistry {
    return this.registry
  }

  /**
   * Get event bus
   */
  getEventBus(): EventBus {
    return this.eventBus
  }

  /**
   * Get system statistics
   */
  getStats() {
    return {
      ...this.registry.getStats(),
      initialized: this.initialized,
      eventListeners: this.eventBus.getListenerCount(),
      hooks: this.hookRegistry.getHookCount(),
    }
  }

  /**
   * Create plugin context
   */
  private createPluginContext(packageName: string): PluginContext {
    const pluginId = extractPluginId(packageName)

    const logger: PluginLogger = {
      debug: (message: string, ...args: any[]) => 
        logDebug(message, { component: 'Plugin', pluginId, args }),
      info: (message: string, ...args: any[]) => 
        logInfo(message, { component: 'Plugin', pluginId, args }),
      warn: (message: string, ...args: any[]) => 
        logWarn(message, { component: 'Plugin', pluginId, args }),
      error: (message: string, ...args: any[]) => 
        logError(message, undefined, { component: 'Plugin', pluginId, args }),
    }

    return {
      pluginId,
      config: this.configManager.getConfig(pluginId),
      logger,
      emit: (event: string, data: any) => this.eventBus.emit(event, data),
      on: (event: string, handler: Function) => this.eventBus.on(event, handler),
      getPlugin: (id: string) => this.registry.get(id),
    }
  }

  /**
   * Shutdown plugin system
   */
  async shutdown(): Promise<void> {
    logInfo('Shutting down plugin system...', { component: 'PluginManager' })

    // Disable all plugins
    for (const plugin of this.registry.getEnabled()) {
      await this.disablePlugin(plugin.id)
    }

    // Clear all caches
    this.configManager.clearCache()
    this.loader.clearCache()
    this.registry.clear()

    this.initialized = false
    logInfo('Plugin system shut down', { component: 'PluginManager' })
  }
}

// Singleton instance
let pluginManagerInstance: PluginManager | null = null

/**
 * Get the global plugin manager instance
 */
export function getPluginManager(): PluginManager {
  if (!pluginManagerInstance) {
    pluginManagerInstance = new PluginManager()
  }
  return pluginManagerInstance
}

/**
 * Reset the plugin manager (for testing)
 */
export function resetPluginManager(): void {
  pluginManagerInstance = null
}

