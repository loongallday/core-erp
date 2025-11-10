import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/database'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles:user_roles!user_roles_user_id_fkey(role:roles(*))
        `)
        .order('name')

      if (error) throw error
      return data as (User & { roles?: any[] })[]
    },
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles:user_roles!user_roles_user_id_fkey(role:roles(*))
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as User & { roles?: any[] }
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userData: { email: string; name: string; phone?: string; role_ids: string[] }) => {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData,
      })

      if (error) throw error
      if (!data.success) throw new Error(data.error)
      return data.user
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<User> & { id: string }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as User
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

