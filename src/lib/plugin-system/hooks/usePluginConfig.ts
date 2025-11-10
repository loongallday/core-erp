/**
 * usePluginConfig Hook
 * 
 * Access plugin configuration from React components.
 */

import { useMemo } from 'react'
import { usePluginContext } from './usePluginContext'

/**
 * Hook to get configuration for a specific plugin
 * 
 * @param pluginId - ID of the plugin
 * @returns Plugin configuration object
 * 
 * @example
 * ```tsx
 * function InventorySettings() {
 *   const config = usePluginConfig<InventoryConfig>('inventory')
 *   
 *   return (
 *     <div>
 *       <p>Default Warehouse: {config?.defaultWarehouse}</p>
 *       <p>Auto Reorder: {config?.autoReorder ? 'Yes' : 'No'}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function usePluginConfig<T = any>(pluginId: string): T | undefined {
  const { manager, initialized } = usePluginContext()

  return useMemo(() => {
    if (!initialized) {
      return undefined
    }

    return manager.getPluginConfig<T>(pluginId)
  }, [manager, pluginId, initialized])
}

/**
 * Hook to get a specific configuration value by path
 * 
 * @param pluginId - ID of the plugin
 * @param path - Dot-notation path to the config value
 * @returns Configuration value
 * 
 * @example
 * ```tsx
 * function StockAlert() {
 *   const threshold = usePluginConfigValue('inventory', 'notifications.alertThresholdDays')
 *   
 *   return <p>Alert {threshold} days before expiry</p>
 * }
 * ```
 */
export function usePluginConfigValue(pluginId: string, path: string): any {
  const config = usePluginConfig(pluginId)

  return useMemo(() => {
    if (!config) {
      return undefined
    }

    // Navigate through the path
    const keys = path.split('.')
    let value: any = config

    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined
      }
      value = value[key]
    }

    return value
  }, [config, path])
}

/**
 * Hook to check if a plugin feature is enabled
 * 
 * @param pluginId - ID of the plugin
 * @param featureName - Name of the feature
 * @returns true if feature is enabled
 * 
 * @example
 * ```tsx
 * function InventoryPage() {
 *   const hasBarcode = usePluginFeature('inventory', 'barcode-scanning')
 *   
 *   return (
 *     <div>
 *       {hasBarcode && <BarcodeScanner />}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePluginFeature(pluginId: string, featureName: string): boolean {
  const { manager, initialized } = usePluginContext()

  return useMemo(() => {
    if (!initialized) {
      return false
    }

    return manager.isFeatureEnabled(pluginId, featureName)
  }, [manager, pluginId, featureName, initialized])
}

