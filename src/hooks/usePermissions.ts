import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Permission } from '@/types/database'

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('category, name')

      if (error) throw error
      return data as Permission[]
    },
  })
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return []

      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission:permissions(*)')
        .eq('role_id', roleId)

      if (error) throw error
      return data.map((rp: any) => rp.permission) as Permission[]
    },
    enabled: !!roleId,
  })
}

