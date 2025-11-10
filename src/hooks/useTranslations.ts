import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { clearTranslationCache } from '@/lib/supabaseI18nBackend'
import i18n from '@/i18n/config'

export interface Translation {
  id: string
  locale: string
  namespace: string
  key: string
  value: string
  created_at: string
  updated_at: string
}

export interface TranslationFilters {
  locale?: string
  namespace?: string
  search?: string
}

/**
 * Shared success handler for translation mutations
 */
function handleTranslationMutationSuccess(
  queryClient: ReturnType<typeof useQueryClient>,
  successMessage: string,
  data?: { locale?: string; namespace?: string }
) {
  queryClient.invalidateQueries({ queryKey: ['translations'] })
  clearTranslationCache()
  
  if (data?.locale && data?.namespace) {
    i18n.reloadResources(data.locale, data.namespace)
  }
  
  toast.success(successMessage)
}

/**
 * Shared error handler for translation mutations
 */
function handleTranslationMutationError(error: any, fallbackMessage: string) {
  toast.error(error.message || fallbackMessage)
}

/**
 * Fetch all translations with optional filters
 */
export function useTranslations(filters?: TranslationFilters) {
  return useQuery({
    queryKey: ['translations', filters],
    queryFn: async () => {
      let query = supabase
        .from('translations')
        .select('*')
        .order('locale')
        .order('namespace')
        .order('key')

      if (filters?.locale) {
        query = query.eq('locale', filters.locale)
      }

      if (filters?.namespace) {
        query = query.eq('namespace', filters.namespace)
      }

      if (filters?.search) {
        query = query.or(`key.ilike.%${filters.search}%,value.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Translation[]
    },
  })
}

/**
 * Get a single translation by ID
 */
export function useTranslation(id: string) {
  return useQuery({
    queryKey: ['translations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Translation
    },
    enabled: !!id,
  })
}

/**
 * Create a new translation
 */
export function useCreateTranslation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (translation: Omit<Translation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await (supabase
        .from('translations') as any)
        .insert(translation)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      handleTranslationMutationSuccess(
        queryClient, 
        'Translation created successfully',
        data
      )
    },
    onError: (error: any) => {
      handleTranslationMutationError(error, 'Failed to create translation')
    },
  })
}

/**
 * Update an existing translation
 */
export function useUpdateTranslation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Translation> & { id: string }) => {
      const { data, error } = await (supabase
        .from('translations') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      handleTranslationMutationSuccess(
        queryClient,
        'Translation updated successfully',
        data
      )
    },
    onError: (error: any) => {
      handleTranslationMutationError(error, 'Failed to update translation')
    },
  })
}

/**
 * Delete a translation
 */
export function useDeleteTranslation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      handleTranslationMutationSuccess(
        queryClient,
        'Translation deleted successfully'
      )
    },
    onError: (error: any) => {
      handleTranslationMutationError(error, 'Failed to delete translation')
    },
  })
}

/**
 * Bulk update translations
 */
export function useBulkUpdateTranslations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (translations: Array<Partial<Translation> & { id: string }>) => {
      const promises = translations.map(({ id, ...updates }) =>
        (supabase
          .from('translations') as any)
          .update(updates)
          .eq('id', id)
      )

      const results = await Promise.all(promises)
      const errors = results.filter(r => r.error)
      
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} translation(s)`)
      }
    },
    onSuccess: () => {
      handleTranslationMutationSuccess(
        queryClient,
        'Translations updated successfully'
      )
    },
    onError: (error: any) => {
      handleTranslationMutationError(error, 'Failed to update translations')
    },
  })
}

