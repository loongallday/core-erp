/**
 * Hook to access plugin context
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { manager, routes, menuItems } = usePluginContext()
 *   
 *   return (
 *     <div>
 *       <p>Total plugins: {manager.getRegistry().getAll().length}</p>
 *       <p>Total routes: {routes.length}</p>
 *     </div>
 *   )
 * }
 * ```
 */

import { useContext } from 'react'
import { PluginContext } from '../context/PluginContext'

export function usePluginContext() {
  const context = useContext(PluginContext)
  
  if (context === undefined) {
    throw new Error('usePluginContext must be used within a PluginProvider')
  }
  
  return context
}

