import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  getSystemConfig,
  getConfigValue,
  clearConfigCache,
  SystemConfig,
} from '../../supabase/constants'

/**
 * Fetch system configuration with React Query
 * Provides automatic caching, refetching, and loading states
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data: config, isLoading, error } = useSystemConfig()
 *   
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage />
 *   
 *   return <div>Max retries: {config.MAX_AUTH_RETRIES}</div>
 * }
 * ```
 */
export function useSystemConfig() {
  return useQuery({
    queryKey: ['system_config'],
    queryFn: getSystemConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

/**
 * Get a specific config value
 * 
 * @example
 * ```tsx
 * function AuthComponent() {
 *   const { data: maxRetries } = useSystemConfigValue('MAX_AUTH_RETRIES')
 *   return <div>Max retries: {maxRetries}</div>
 * }
 * ```
 */
export function useSystemConfigValue<K extends keyof SystemConfig>(key: K) {
  return useQuery({
    queryKey: ['system_config', key],
    queryFn: () => getConfigValue(key),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
}

/**
 * Update a system configuration value
 * Requires 'system:configure' permission
 * 
 * @example
 * ```tsx
 * function SettingsPage() {
 *   const updateConfig = useUpdateSystemConfig()
 *   
 *   const handleSave = () => {
 *     updateConfig.mutate({
 *       key: 'MAX_AUTH_RETRIES',
 *       value: 5
 *     })
 *   }
 * }
 * ```
 */
export function useUpdateSystemConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await (supabase
        .from('system_config') as any)
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_config'] })
      clearConfigCache()
      toast.success('System configuration updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update system configuration')
    },
  })
}

/**
 * Get all system config from database (for admin UI)
 * Returns full config rows including metadata
 */
export function useSystemConfigAdmin() {
  return useQuery({
    queryKey: ['system_config', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .order('category')
        .order('key')

      if (error) throw error
      return data
    },
  })
}

/**
 * Bulk update multiple config values
 * Useful for settings pages with multiple fields
 */
export function useBulkUpdateSystemConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Array<{ key: string; value: any }>) => {
      const promises = updates.map(({ key, value }) =>
        (supabase
          .from('system_config') as any)
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key)
      )

      const results = await Promise.all(promises)
      const errors = results.filter((r) => r.error)

      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} configuration(s)`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_config'] })
      clearConfigCache()
      toast.success('System configurations updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update system configurations')
    },
  })
}

