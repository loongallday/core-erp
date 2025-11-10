/**
 * Core ERP Plugin System - Type Definitions
 * 
 * This file contains all TypeScript interfaces and types that define the plugin protocol.
 * These types establish the contract between the core system and plugins.
 */

import { ComponentType, LazyExoticComponent } from 'react'
import { z } from 'zod'

// ============================================================================
// PLUGIN MANIFEST
// ============================================================================

/**
 * Main plugin manifest interface
 * Every plugin must export an object conforming to this interface
 */
export interface PluginManifest {
  // Basic metadata
  id: string
  name: string
  version: string
  description: string
  author: string
  homepage?: string
  license?: string
  category: PluginCategory
  tags?: string[]

  // Compatibility
  coreVersion: string // Semver range
  dependencies?: PluginDependencies

  // Configuration
  config?: PluginConfigDefinition

  // Translations
  translations?: PluginTranslationsDefinition

  // Frontend capabilities
  frontend?: PluginFrontendCapabilities

  // Backend capabilities
  backend?: PluginBackendCapabilities

  // Database capabilities
  database?: PluginDatabaseCapabilities

  // Permissions
  permissions?: PluginPermissionsDefinition

  // Events
  events?: PluginEventsDefinition

  // Lifecycle hooks
  lifecycle?: PluginLifecycleHooks

  // Health check
  healthCheck?: () => Promise<PluginHealthStatus>
}

// ============================================================================
// PLUGIN CATEGORIES
// ============================================================================

export type PluginCategory =
  | 'operations'    // Inventory, Manufacturing, Warehouse
  | 'sales'         // CRM, Sales, Orders
  | 'finance'       // Accounting, Invoicing, Payments
  | 'hr'            // Human Resources, Payroll
  | 'analytics'     // Reports, Dashboards, BI
  | 'integration'   // Third-party integrations
  | 'utility'       // Tools and utilities
  | 'custom'        // Custom category

// ============================================================================
// PLUGIN DEPENDENCIES
// ============================================================================

export interface PluginDependencies {
  plugins?: string[]                    // Other plugin IDs this depends on
  packages?: Record<string, string>     // NPM packages with version ranges
}

// ============================================================================
// PLUGIN CONFIGURATION
// ============================================================================

export interface PluginConfigDefinition {
  schema: z.ZodSchema                   // Zod schema for validation
  defaults: Record<string, any>         // Default configuration values
}

// ============================================================================
// PLUGIN TRANSLATIONS
// ============================================================================

export interface PluginTranslationsDefinition {
  namespaces: string[]                                    // i18n namespaces
  defaults: Record<string, PluginTranslationLoader>       // Default translations by locale
  schema?: Record<string, string>                         // Translation keys schema
}

export type PluginTranslationLoader = Record<string, () => Promise<any>>

// ============================================================================
// FRONTEND CAPABILITIES
// ============================================================================

export interface PluginFrontendCapabilities {
  routes?: () => Promise<{ default: PluginRoute[] }>
  menu?: () => Promise<{ default: PluginMenuItem[] }>
  widgets?: () => Promise<{ default: PluginWidget[] }>
  components?: Record<string, () => Promise<{ default: ComponentType<any> }>>
  hooks?: Record<string, () => Promise<{ default: Function }>>
  extensions?: Record<string, () => Promise<{ default: ComponentType<any> }>>
}

/**
 * Plugin route definition
 */
export interface PluginRoute {
  path: string
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>
  requiredPermission?: string
  exact?: boolean
  children?: PluginRoute[]
}

/**
 * Plugin menu item definition
 */
export interface PluginMenuItem {
  id: string
  path: string
  label: string
  icon?: string                         // Lucide icon name
  permission?: string
  order?: number
  group?: string
  badge?: () => Promise<number | string>
  children?: PluginMenuItem[]
}

/**
 * Plugin dashboard widget definition
 */
export interface PluginWidget {
  id: string
  name: string
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>
  defaultSize?: 'small' | 'medium' | 'large' | 'full'
  defaultPosition?: number
  requiredPermission?: string
}

// ============================================================================
// BACKEND CAPABILITIES
// ============================================================================

export interface PluginBackendCapabilities {
  functions?: () => Promise<{ default: PluginEdgeFunction[] }>
  middleware?: Record<string, () => Promise<{ default: PluginMiddleware }>>
  providers?: Record<string, () => Promise<{ default: PluginDataProvider }>>
  jobs?: Record<string, PluginBackgroundJob>
}

/**
 * Plugin Edge Function definition
 */
export interface PluginEdgeFunction {
  name: string
  path: string                          // Relative path to function code
  handler: Function
}

/**
 * Plugin middleware definition
 */
export interface PluginMiddleware {
  name: string
  handler: (req: any, res: any, next: Function) => Promise<void> | void
}

/**
 * Plugin data provider definition
 */
export interface PluginDataProvider {
  name: string
  methods: Record<string, Function>
}

/**
 * Plugin background job definition
 */
export interface PluginBackgroundJob {
  handler: () => Promise<{ default: Function }>
  schedule: string                      // Cron expression
  enabled?: boolean
}

// ============================================================================
// DATABASE CAPABILITIES
// ============================================================================

export interface PluginDatabaseCapabilities {
  migrations?: () => Promise<{ default: PluginMigration[] }>
  seeds?: () => Promise<{ default: PluginSeed[] }>
  schemas?: Record<string, () => Promise<{ default: PluginTableSchema }>>
}

/**
 * Plugin migration definition
 */
export interface PluginMigration {
  id: string
  name: string
  timestamp: number
  up: string                            // SQL for migration
  down?: string                         // SQL for rollback
}

/**
 * Plugin seed data definition
 */
export interface PluginSeed {
  id: string
  name: string
  data: Record<string, any>
  table: string
}

/**
 * Plugin table schema definition
 */
export interface PluginTableSchema {
  name: string
  columns: PluginColumnDefinition[]
  indexes?: PluginIndexDefinition[]
  foreignKeys?: PluginForeignKeyDefinition[]
}

export interface PluginColumnDefinition {
  name: string
  type: string
  nullable?: boolean
  default?: any
  primary?: boolean
  unique?: boolean
}

export interface PluginIndexDefinition {
  name: string
  columns: string[]
  unique?: boolean
}

export interface PluginForeignKeyDefinition {
  column: string
  references: {
    table: string
    column: string
  }
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT'
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT'
}

// ============================================================================
// PERMISSIONS
// ============================================================================

export interface PluginPermissionsDefinition {
  (): Promise<{ default: PluginPermission[] }>
}

/**
 * Plugin permission definition
 */
export interface PluginPermission {
  code: string                          // e.g., 'inventory:view'
  name: string
  description: string
  category: string
}

// ============================================================================
// EVENTS
// ============================================================================

export interface PluginEventsDefinition {
  emits?: string[]                                                      // Events this plugin emits
  listens?: Record<string, () => Promise<{ default: PluginEventHandler }>>  // Events this plugin listens to
}

export type PluginEventHandler = (data: any) => Promise<void> | void

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

export interface PluginLifecycleHooks {
  onInstall?: (context: PluginContext) => Promise<void> | void
  onEnable?: (context: PluginContext) => Promise<void> | void
  onDisable?: (context: PluginContext) => Promise<void> | void
  onUninstall?: (context: PluginContext) => Promise<void> | void
  onConfigChange?: (oldConfig: any, newConfig: any) => Promise<void> | void
  beforeStart?: (context: PluginContext) => Promise<void> | void
  afterStart?: (context: PluginContext) => Promise<void> | void
}

export interface PluginContext {
  pluginId: string
  config: any
  logger: PluginLogger
  emit: (event: string, data: any) => void
  on: (event: string, handler: PluginEventHandler) => void
  getPlugin: (pluginId: string) => LoadedPlugin | undefined
}

export interface PluginLogger {
  debug: (message: string, ...args: any[]) => void
  info: (message: string, ...args: any[]) => void
  warn: (message: string, ...args: any[]) => void
  error: (message: string, ...args: any[]) => void
}

// ============================================================================
// PLUGIN HEALTH
// ============================================================================

export interface PluginHealthStatus {
  healthy: boolean
  message?: string
  details?: Record<string, any>
  lastCheck?: Date
}

// ============================================================================
// CORE PLUGIN CONFIGURATION (plugins.config.ts)
// ============================================================================

/**
 * Core configuration for plugins
 * This is what goes in plugins.config.ts
 */
export interface PluginsConfiguration {
  global?: GlobalPluginSettings
  plugins: PluginConfiguration[]
}

export interface GlobalPluginSettings {
  enableHotReload?: boolean
  sandboxMode?: 'strict' | 'moderate' | 'permissive'
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  maxMemoryPerPlugin?: number           // MB
  maxExecutionTime?: number             // Seconds
}

/**
 * Configuration for a single plugin in plugins.config.ts
 */
export interface PluginConfiguration {
  package: string                       // NPM package name
  enabled: boolean
  version?: string
  config?: Record<string, any>          // Core overrides for plugin config
  localization?: Record<string, Record<string, string>>  // Core translation overrides
  features?: Record<string, boolean>    // Feature flags
  permissions?: Record<string, string[]>  // Permission to role mappings
  ui?: PluginUIConfiguration
  integration?: PluginIntegrationConfiguration
  hooks?: PluginConfigurationHooks
  rateLimits?: Record<string, number>
}

export interface PluginUIConfiguration {
  theme?: {
    primaryColor?: string
    accentColor?: string
    iconColor?: string
  }
  sidebar?: {
    position?: number
    icon?: string
    label?: string
    group?: string
  }
  dashboard?: {
    widgets?: string[]
    widgetOrder?: number[]
  }
  customStyles?: string
  components?: Record<string, () => Promise<{ default: ComponentType<any> }>>
}

export interface PluginIntegrationConfiguration {
  connectTo?: string[]                  // Plugin IDs to connect with
  dataSharing?: Record<string, string[]>  // Plugin ID -> shared data keys
}

export interface PluginConfigurationHooks {
  onEnable?: () => Promise<void> | void
  onDisable?: () => Promise<void> | void
  beforeLoad?: () => Promise<void> | void
  afterLoad?: () => Promise<void> | void
}

// ============================================================================
// LOADED PLUGIN (Runtime)
// ============================================================================

/**
 * Runtime representation of a loaded plugin
 */
export interface LoadedPlugin {
  id: string
  manifest: PluginManifest
  config: any                           // Merged configuration
  enabled: boolean
  routes?: PluginRoute[]
  menuItems?: PluginMenuItem[]
  widgets?: PluginWidget[]
  permissions?: PluginPermission[]
  context: PluginContext
  status: PluginStatus
}

export type PluginStatus = 
  | 'unloaded'
  | 'loading'
  | 'loaded'
  | 'enabled'
  | 'disabled'
  | 'error'

// ============================================================================
// PLUGIN MANAGER EVENTS
// ============================================================================

export interface PluginManagerEvents {
  'plugin:loading': (pluginId: string) => void
  'plugin:loaded': (pluginId: string) => void
  'plugin:enabled': (pluginId: string) => void
  'plugin:disabled': (pluginId: string) => void
  'plugin:error': (pluginId: string, error: Error) => void
  'plugin:health-check': (pluginId: string, status: PluginHealthStatus) => void
}

// ============================================================================
// PLUGIN VALIDATION
// ============================================================================

export interface PluginValidationResult {
  valid: boolean
  errors: PluginValidationError[]
  warnings: PluginValidationWarning[]
}

export interface PluginValidationError {
  code: string
  message: string
  field?: string
}

export interface PluginValidationWarning {
  code: string
  message: string
  field?: string
}

// ============================================================================
// PLUGIN METADATA
// ============================================================================

export interface PluginMetadata {
  id: string
  name: string
  version: string
  description: string
  author: string
  category: PluginCategory
  installedAt?: Date
  enabledAt?: Date
  lastUpdated?: Date
  size?: number
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  // Re-export all types for convenience
}

