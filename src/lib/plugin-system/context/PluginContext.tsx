/**
 * Plugin Context
 * 
 * React context for accessing the plugin system throughout the application.
 */

import { createContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
import { PluginManager, getPluginManager } from '../PluginManager'
import { PluginRoute, PluginMenuItem, PluginWidget, PluginPermission } from '../types'

interface PluginContextValue {
  manager: PluginManager
  initialized: boolean
  loading: boolean
  error: Error | null
  routes: PluginRoute[]
  menuItems: PluginMenuItem[]
  widgets: PluginWidget[]
  permissions: PluginPermission[]
  reload: () => Promise<void>
}

const PluginContext = createContext<PluginContextValue | undefined>(undefined)

export { PluginContext }
export type { PluginContextValue }

interface PluginProviderProps {
  children: ReactNode
  config?: any
  autoInitialize?: boolean
}

/**
 * Plugin Provider Component
 * 
 * Wraps your application to provide plugin system access.
 * 
 * @example
 * ```tsx
 * import { PluginProvider } from '@/lib/plugin-system'
 * import pluginConfig from '@/plugins.config'
 * 
 * function App() {
 *   return (
 *     <PluginProvider config={pluginConfig}>
 *       <YourApp />
 *     </PluginProvider>
 *   )
 * }
 * ```
 */
export function PluginProvider({ 
  children, 
  config,
  autoInitialize = true 
}: PluginProviderProps) {
  const [manager] = useState(() => getPluginManager())
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(autoInitialize)
  const [error, setError] = useState<Error | null>(null)
  const [routes, setRoutes] = useState<PluginRoute[]>([])
  const [menuItems, setMenuItems] = useState<PluginMenuItem[]>([])
  const [widgets, setWidgets] = useState<PluginWidget[]>([])
  const [permissions, setPermissions] = useState<PluginPermission[]>([])

  const loadPluginData = useCallback(() => {
    try {
      setRoutes(manager.getRoutes())
      setMenuItems(manager.getMenuItems())
      setWidgets(manager.getWidgets())
      setPermissions(manager.getPermissions())
    } catch (err) {
      console.error('[PluginContext] Error loading plugin data:', err)
    }
  }, [manager])

  const initializePlugins = useCallback(async () => {
    if (!config) {
      console.warn('[PluginContext] No config provided, skipping initialization')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      await manager.initialize(config)
      
      loadPluginData()
      
      setInitialized(true)
      console.log('[PluginContext] Plugin system initialized')
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Plugin initialization failed')
      setError(error)
      console.error('[PluginContext] Initialization error:', error)
    } finally {
      setLoading(false)
    }
  }, [config, manager, loadPluginData])

  const reload = async () => {
    await initializePlugins()
  }

  useEffect(() => {
    if (autoInitialize) {
      initializePlugins()
    }
  }, [autoInitialize, initializePlugins])

  // Listen to plugin events
  useEffect(() => {
    const handlePluginEnabled = () => {
      console.log('[PluginContext] Plugin enabled, reloading data')
      loadPluginData()
    }

    const handlePluginDisabled = () => {
      console.log('[PluginContext] Plugin disabled, reloading data')
      loadPluginData()
    }

    manager.on('plugin:enabled', handlePluginEnabled)
    manager.on('plugin:disabled', handlePluginDisabled)

    return () => {
      // Note: EventBus doesn't have off method yet, would need to store unsubscribe functions
    }
  }, [manager, loadPluginData])

  const value: PluginContextValue = useMemo(() => ({
    manager,
    initialized,
    loading,
    error,
    routes,
    menuItems,
    widgets,
    permissions,
    reload,
  }), [manager, initialized, loading, error, routes, menuItems, widgets, permissions, reload])

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  )
}
