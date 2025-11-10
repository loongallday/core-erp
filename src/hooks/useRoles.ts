import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types/database'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('level', { ascending: false })

      if (error) throw error
      return data as Role[]
    },
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          permissions:role_permissions(permission:permissions(*))
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useAssignRoles() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ user_id, role_ids }: { user_id: string; role_ids: string[] }) => {
      const { data, error } = await supabase.functions.invoke('assign-roles', {
        body: { user_id, role_ids },
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

