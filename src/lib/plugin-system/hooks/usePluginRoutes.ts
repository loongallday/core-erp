/**
 * usePluginRoutes Hook
 * 
 * Get all registered plugin routes.
 */

import { useMemo } from 'react'
import { usePluginContext } from './usePluginContext'
import { PluginRoute } from '../types'

/**
 * Hook to get all plugin routes
 * 
 * @returns Array of plugin routes
 * 
 * @example
 * ```tsx
 * function AppRoutes() {
 *   const pluginRoutes = usePluginRoutes()
 *   
 *   return (
 *     <Routes>
 *       {pluginRoutes.map(route => (
 *         <Route 
 *           key={route.path} 
 *           path={route.path} 
 *           element={<route.component />} 
 *         />
 *       ))}
 *     </Routes>
 *   )
 * }
 * ```
 */
export function usePluginRoutes(): PluginRoute[] {
  const { routes, initialized } = usePluginContext()

  return useMemo(() => {
    if (!initialized) {
      return []
    }

    return routes
  }, [routes, initialized])
}

/**
 * Hook to get plugin routes filtered by permission
 * 
 * @param userPermissions - Array of user's permission codes
 * @returns Filtered array of plugin routes
 */
export function useFilteredPluginRoutes(userPermissions: string[]): PluginRoute[] {
  const routes = usePluginRoutes()

  return useMemo(() => {
    return routes.filter(route => {
      // If route has no required permission, it's accessible to all
      if (!route.requiredPermission) {
        return true
      }

      // Check if user has the required permission
      return userPermissions.includes(route.requiredPermission)
    })
  }, [routes, userPermissions])
}

