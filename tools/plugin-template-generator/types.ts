/**
 * Type Definitions for Plugin Template Generator
 * 
 * This module contains all TypeScript interfaces and types used throughout
 * the plugin template generator system.
 */

/**
 * Plugin categories available in Core ERP
 */
export type PluginCategory =
  | 'operations'    // Inventory, Manufacturing, Warehouse
  | 'sales'         // CRM, Sales, Orders
  | 'finance'       // Accounting, Invoicing, Payments
  | 'hr'            // Human Resources, Payroll
  | 'analytics'     // Reports, Dashboards, BI
  | 'integration'   // Third-party integrations
  | 'utility'       // Tools and utilities
  | 'custom'        // Custom category

/**
 * Features that can be included in a plugin
 */
export interface PluginFeatures {
  /** Include frontend routes and pages */
  frontend: boolean
  
  /** Include menu items */
  menu: boolean
  
  /** Include dashboard widgets */
  widgets: boolean
  
  /** Include backend Edge Functions */
  backend: boolean
  
  /** Include database migrations */
  database: boolean
  
  /** Include permission definitions */
  permissions: boolean
  
  /** Include translations (en + th) */
  translations: boolean
  
  /** Include event handlers */
  events: boolean
}

/**
 * User responses from interactive prompts
 */
export interface PromptAnswers {
  /** Plugin name (e.g., "Inventory Management") */
  pluginName: string
  
  /** Plugin category */
  category: PluginCategory
  
  /** Plugin description */
  description: string
  
  /** Plugin author */
  author: string
  
  /** Output directory path */
  outputDirectory: string
  
  /** Selected features */
  features: string[]
  
  /** Resource name for CRUD example (e.g., "Item", "Product") */
  resourceName: string
}

/**
 * Processed plugin metadata used for generation
 */
export interface PluginMetadata {
  /** Original plugin name */
  name: string
  
  /** Plugin ID (kebab-case) */
  id: string
  
  /** Package name (@core-erp/plugin-{id}) */
  packageName: string
  
  /** Description */
  description: string
  
  /** Author */
  author: string
  
  /** Category */
  category: PluginCategory
  
  /** Output directory (absolute path) */
  outputDir: string
  
  /** Selected features */
  features: PluginFeatures
  
  /** Resource name for CRUD (singular, PascalCase) */
  resourceName: string
  
  /** Resource name (plural, PascalCase) */
  resourceNamePlural: string
  
  /** Resource name (singular, camelCase) */
  resourceNameCamel: string
  
  /** Resource name (plural, camelCase) */
  resourceNameCamelPlural: string
  
  /** Resource name (singular, kebab-case) */
  resourceNameKebab: string
  
  /** Resource name (plural, kebab-case) */
  resourceNameKebabPlural: string
  
  /** Resource name (singular, snake_case) */
  resourceNameSnake: string
  
  /** Resource name (plural, snake_case) */
  resourceNameSnakePlural: string
  
  /** Current year (for copyright) */
  year: string
}

/**
 * Template function signature
 * 
 * All template functions should follow this signature.
 * They receive plugin metadata and return the file content as a string.
 */
export type TemplateFunction = (meta: PluginMetadata) => string

/**
 * File to be generated
 */
export interface GeneratedFile {
  /** Relative path from plugin root */
  path: string
  
  /** File content */
  content: string
}

/**
 * Generation result summary
 */
export interface GenerationResult {
  /** Whether generation was successful */
  success: boolean
  
  /** Plugin directory path */
  pluginDir: string
  
  /** Number of files generated */
  filesGenerated: number
  
  /** List of generated file paths */
  files: string[]
  
  /** Any errors encountered */
  errors?: string[]
}

