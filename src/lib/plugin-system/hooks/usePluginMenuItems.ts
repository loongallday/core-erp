/**
 * usePluginMenuItems Hook
 * 
 * Get all registered plugin menu items.
 */

import { useMemo } from 'react'
import { usePluginContext } from './usePluginContext'
import { PluginMenuItem } from '../types'

/**
 * Hook to get all plugin menu items
 * 
 * @returns Array of plugin menu items (sorted by order)
 * 
 * @example
 * ```tsx
 * function AppMenu() {
 *   const pluginMenuItems = usePluginMenuItems()
 *   
 *   return (
 *     <nav>
 *       {pluginMenuItems.map(item => (
 *         <MenuItem key={item.id} {...item} />
 *       ))}
 *     </nav>
 *   )
 * }
 * ```
 */
export function usePluginMenuItems(): PluginMenuItem[] {
  const { menuItems, initialized } = usePluginContext()

  return useMemo(() => {
    if (!initialized) {
      return []
    }

    // Already sorted by PluginManager
    return menuItems
  }, [menuItems, initialized])
}

/**
 * Hook to get plugin menu items filtered by permission
 * 
 * @param userPermissions - Array of user's permission codes
 * @returns Filtered array of plugin menu items
 */
export function useFilteredPluginMenuItems(userPermissions: string[]): PluginMenuItem[] {
  const menuItems = usePluginMenuItems()

  return useMemo(() => {
    return menuItems.filter(item => {
      // If menu item has no required permission, it's visible to all
      if (!item.permission) {
        return true
      }

      // Check if user has the required permission
      return userPermissions.includes(item.permission)
    })
  }, [menuItems, userPermissions])
}

/**
 * Hook to get plugin menu items grouped by group
 * 
 * @returns Object with menu items grouped by group name
 * 
 * @example
 * ```tsx
 * function GroupedMenu() {
 *   const groupedItems = useGroupedPluginMenuItems()
 *   
 *   return (
 *     <div>
 *       {Object.entries(groupedItems).map(([group, items]) => (
 *         <div key={group}>
 *           <h3>{group}</h3>
 *           {items.map(item => <MenuItem key={item.id} {...item} />)}
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useGroupedPluginMenuItems(): Record<string, PluginMenuItem[]> {
  const menuItems = usePluginMenuItems()

  return useMemo(() => {
    const grouped: Record<string, PluginMenuItem[]> = {}

    for (const item of menuItems) {
      const group = item.group || 'default'
      
      if (!grouped[group]) {
        grouped[group] = []
      }

      grouped[group].push(item)
    }

    return grouped
  }, [menuItems])
}

