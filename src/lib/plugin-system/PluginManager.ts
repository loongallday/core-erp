/**
 * Plugin Manager
 * 
 * Central orchestrator for the plugin system.
 * Manages plugin lifecycle, configuration, and integration with core system.
 */

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

    console.log('[PluginManager] Plugin system initialized')
  }

  /**
   * Initialize the plugin system with configuration
   */
  async initialize(config: PluginsConfiguration): Promise<void> {
    if (this.initialized) {
      // Already initialized (React StrictMode may call this twice)
      return
    }

    console.log('[PluginManager] Starting initialization...')
    this.configuration = config

    try {
      // 1. Load plugins from configuration
      const enabledPlugins = config.plugins.filter(p => p.enabled)
      console.log(`[PluginManager] Loading ${enabledPlugins.length} enabled plugins...`)

      for (const pluginConfig of enabledPlugins) {
        await this.loadPlugin(pluginConfig)
      }

      // 2. Resolve dependencies and determine load order
      const loadOrder = this.dependencyResolver.resolve(
        new Map(Array.from(this.registry.getAll().map(p => [p.id, p])))
      )
      console.log(`[PluginManager] Load order: ${loadOrder.join(' → ')}`)

      // 3. Enable plugins in correct order
      for (const pluginId of loadOrder) {
        await this.enablePlugin(pluginId)
      }

      this.initialized = true
      console.log('[PluginManager] Initialization complete')

      // Emit initialization complete event
      this.eventBus.emit('plugin-system:initialized', {
        pluginCount: this.registry.getAll().length,
        enabledCount: this.registry.getEnabled().length,
      })
    } catch (error) {
      console.error('[PluginManager] Initialization failed:', error)
      throw error
    }
  }

  /**
   * Load a single plugin
   */
  private async loadPlugin(config: PluginConfiguration): Promise<void> {
    try {
      console.log(`[PluginManager] Loading plugin: ${config.package}`)

      // Create plugin context
      const context = this.createPluginContext(config.package)

      // Register the plugin
      const loadedPlugin = await this.registry.register(config, context)

      // Load and validate configuration
      await this.configManager.loadConfig(loadedPlugin.manifest, config)

      // Load plugin translations
      await this.localizationManager.loadPluginTranslations(loadedPlugin.manifest, config)

      console.log(`[PluginManager] Plugin loaded: ${loadedPlugin.id}`)
    } catch (error) {
      console.error(`[PluginManager] Failed to load plugin ${config.package}:`, error)
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
      console.log(`[PluginManager] Enabling plugin: ${pluginId}`)

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

      console.log(`[PluginManager] Plugin enabled: ${pluginId}`)

      // Emit event
      this.eventBus.emit('plugin:enabled', pluginId)
    } catch (error) {
      console.error(`[PluginManager] Failed to enable plugin ${pluginId}:`, error)
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
        console.log(`[PluginManager] Loaded ${plugin.routes.length} routes for ${plugin.id}`)
      } catch (error) {
        console.error(`[PluginManager] Failed to load routes for ${plugin.id}:`, error)
      }
    }

    // Load menu items
    if (manifest.frontend?.menu) {
      try {
        const menuModule = await manifest.frontend.menu()
        plugin.menuItems = menuModule.default
        console.log(`[PluginManager] Loaded ${plugin.menuItems.length} menu items for ${plugin.id}`)
      } catch (error) {
        console.error(`[PluginManager] Failed to load menu for ${plugin.id}:`, error)
      }
    }

    // Load widgets
    if (manifest.frontend?.widgets) {
      try {
        const widgetsModule = await manifest.frontend.widgets()
        plugin.widgets = widgetsModule.default
        console.log(`[PluginManager] Loaded ${plugin.widgets.length} widgets for ${plugin.id}`)
      } catch (error) {
        console.error(`[PluginManager] Failed to load widgets for ${plugin.id}:`, error)
      }
    }

    // Load permissions
    if (manifest.permissions) {
      try {
        const permissionsModule = await manifest.permissions()
        plugin.permissions = permissionsModule.default
        console.log(`[PluginManager] Loaded ${plugin.permissions.length} permissions for ${plugin.id}`)
      } catch (error) {
        console.error(`[PluginManager] Failed to load permissions for ${plugin.id}:`, error)
      }
    }

    // Register event listeners
    if (manifest.events?.listens) {
      for (const [eventName, handlerLoader] of Object.entries(manifest.events.listens)) {
        try {
          const handlerModule = await handlerLoader()
          this.eventBus.on(eventName, handlerModule.default)
          console.log(`[PluginManager] Registered event listener for ${eventName}`)
        } catch (error) {
          console.error(`[PluginManager] Failed to register event listener for ${eventName}:`, error)
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
      console.log(`[PluginManager] Disabling plugin: ${pluginId}`)

      // Call onDisable lifecycle hook
      if (plugin.manifest.lifecycle?.onDisable) {
        await plugin.manifest.lifecycle.onDisable(plugin.context)
      }

      // Update status
      this.registry.updateStatus(pluginId, 'disabled')
      plugin.enabled = false

      console.log(`[PluginManager] Plugin disabled: ${pluginId}`)

      // Emit event
      this.eventBus.emit('plugin:disabled', pluginId)
    } catch (error) {
      console.error(`[PluginManager] Failed to disable plugin ${pluginId}:`, error)
      throw error
    }
  }

  /**
   * Get all plugin routes
   */
  getRoutes(): PluginRoute[] {
    const routes: PluginRoute[] = []
    
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.routes) {
        routes.push(...plugin.routes)
      }
    }

    return routes
  }

  /**
   * Get all plugin menu items
   */
  getMenuItems(): PluginMenuItem[] {
    const menuItems: PluginMenuItem[] = []
    
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.menuItems) {
        menuItems.push(...plugin.menuItems)
      }
    }

    // Sort by order
    return menuItems.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  /**
   * Get all plugin widgets
   */
  getWidgets(): PluginWidget[] {
    const widgets: PluginWidget[] = []
    
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.widgets) {
        widgets.push(...plugin.widgets)
      }
    }

    return widgets
  }

  /**
   * Get all plugin permissions
   */
  getPermissions(): PluginPermission[] {
    const permissions: PluginPermission[] = []
    
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.permissions) {
        permissions.push(...plugin.permissions)
      }
    }

    return permissions
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
    const pluginId = this.extractPluginId(packageName)

    const logger: PluginLogger = {
      debug: (message: string, ...args: any[]) => 
        console.debug(`[Plugin:${pluginId}]`, message, ...args),
      info: (message: string, ...args: any[]) => 
        console.info(`[Plugin:${pluginId}]`, message, ...args),
      warn: (message: string, ...args: any[]) => 
        console.warn(`[Plugin:${pluginId}]`, message, ...args),
      error: (message: string, ...args: any[]) => 
        console.error(`[Plugin:${pluginId}]`, message, ...args),
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
   * Extract plugin ID from package name
   */
  private extractPluginId(packageName: string): string {
    if (packageName.startsWith('@')) {
      const parts = packageName.split('/')
      if (parts.length === 2) {
        return parts[1].replace('plugin-', '')
      }
    }
    return packageName.replace('plugin-', '')
  }

  /**
   * Shutdown plugin system
   */
  async shutdown(): Promise<void> {
    console.log('[PluginManager] Shutting down plugin system...')

    // Disable all plugins
    for (const plugin of this.registry.getEnabled()) {
      await this.disablePlugin(plugin.id)
    }

    // Clear all caches
    this.configManager.clearCache()
    this.loader.clearCache()
    this.registry.clear()

    this.initialized = false
    console.log('[PluginManager] Plugin system shut down')
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

