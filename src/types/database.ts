// Database types for Core ERP

export interface User {
  id: string
  auth_user_id: string | null
  email: string
  name: string
  phone?: string | null
  avatar_url?: string | null
  is_active: boolean
  locale: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  code: string
  name: string
  description?: string | null
  level: number
  is_system: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  code: string
  name: string
  description?: string | null
  category?: string | null
  created_at: string
}

export interface UserRole {
  user_id: string
  role_id: string
  assigned_by?: string | null
  assigned_at: string
}

export interface RolePermission {
  role_id: string
  permission_id: string
  created_at: string
}

export interface AuditLog {
  id: string
  user_id?: string | null
  action: string
  resource_type?: string | null
  resource_id?: string | null
  changes?: any
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
}

export interface Translation {
  id: string
  locale: string
  namespace: string
  key: string
  value: string
  plugin_id?: string | null
  is_core_override?: boolean
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      roles: {
        Row: Role
        Insert: Omit<Role, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>
      }
      permissions: {
        Row: Permission
        Insert: Omit<Permission, 'id' | 'created_at'>
        Update: never
      }
      user_roles: {
        Row: UserRole
        Insert: UserRole
        Update: never
      }
      role_permissions: {
        Row: RolePermission
        Insert: RolePermission
        Update: never
      }
      audit_log: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'created_at'>
        Update: never
      }
      translations: {
        Row: Translation
        Insert: Omit<Translation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Translation, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

