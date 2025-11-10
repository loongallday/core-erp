/**
 * Supabase Table Type Definitions
 * 
 * Proper TypeScript types for Supabase table operations
 * to eliminate 'as any' type assertions
 */

import { Translation } from '@/hooks/useTranslations'

// ============================================================================
// TRANSLATIONS TABLE
// ============================================================================

export interface TranslationsTable {
  Row: Translation
  Insert: Omit<Translation, 'id' | 'created_at' | 'updated_at'>
  Update: Partial<Omit<Translation, 'id' | 'created_at' | 'updated_at'>>
}

// ============================================================================
// USERS TABLE (extends types from @core-erp/entity)
// ============================================================================

export interface UsersTable {
  Row: {
    id: string
    auth_user_id: string | null
    email: string
    name: string
    phone: string | null
    avatar_url: string | null
    is_active: boolean
    locale: string | null
    timezone: string | null
    created_at: string
    updated_at: string
  }
  Insert: Omit<UsersTable['Row'], 'id' | 'created_at' | 'updated_at'>
  Update: Partial<Omit<UsersTable['Row'], 'id' | 'created_at' | 'updated_at'>>
}

// ============================================================================
// ROLE_PERMISSIONS TABLE
// ============================================================================

export interface RolePermissionsTable {
  Row: {
    role_id: string
    permission_id: string
    created_at: string
  }
  Insert: Omit<RolePermissionsTable['Row'], 'created_at'>
  Update: never // Not used
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Supabase PostgrestError type
 */
export interface PostgrestError {
  message: string
  details: string | null
  hint: string | null
  code: string
}

/**
 * Generic Supabase response with proper error typing
 */
export type SupabaseResponse<T> = 
  | { data: T; error: null }
  | { data: null; error: PostgrestError }
