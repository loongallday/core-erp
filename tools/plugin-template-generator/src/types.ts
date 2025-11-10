/**
 * Core ERP Plugin Template Generator - Type Definitions
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the plugin template generator system.
 */

/**
 * Plugin categories that can be selected during generation
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
 * Features that can be included in the generated plugin
 */
export interface PluginFeatures {
  frontend: boolean          // React routes and pages
  menu: boolean             // Sidebar menu items
  widgets: boolean          // Dashboard widgets
  backend: boolean          // Edge Functions
  database: boolean         // Migrations and schemas
  permissions: boolean      // Permission definitions
  translations: boolean     // i18n support (en + th)
  events: boolean          // Event handlers
}

/**
 * Complete plugin configuration from user prompts
 */
export interface PluginConfig {
  // Basic metadata
  name: string              // Display name (e.g., "Inventory Management")
  id: string                // Kebab-case ID (e.g., "inventory-management")
  description: string       // Brief description
  author: string            // Author name
  category: PluginCategory  // Plugin category
  
  // Generation settings
  outputDir: string         // Where to generate the plugin
  resourceName: string      // CRUD resource name (e.g., "Item")
  
  // Feature flags
  features: PluginFeatures
}

/**
 * Template metadata for code generation
 * Contains all variables needed for string interpolation
 */
export interface TemplateContext {
  // Plugin identifiers
  pluginName: string              // Display name: "Inventory Management"
  pluginId: string                // Kebab-case: "inventory-management"
  pluginIdCamel: string           // camelCase: "inventoryManagement"
  pluginIdPascal: string          // PascalCase: "InventoryManagement"
  packageName: string             // Full package: "@core-erp/plugin-inventory-management"
  
  // Resource names (for CRUD examples)
  resourceName: string            // Display: "Item"
  resourceNamePlural: string      // Display plural: "Items"
  resourceNameLower: string       // Lower: "item"
  resourceNameLowerPlural: string // Lower plural: "items"
  resourceNameCamel: string       // camelCase: "item"
  resourceNamePascal: string      // PascalCase: "Item"
  
  // Metadata
  description: string             // Plugin description
  author: string                  // Author name
  category: PluginCategory        // Plugin category
  year: string                    // Current year
  date: string                    // Current date (ISO format)
  
  // Feature flags
  features: PluginFeatures
}

/**
 * File to be generated
 */
export interface GeneratedFile {
  path: string      // Relative path from plugin root
  content: string   // File content
}

/**
 * Result of the generation process
 */
export interface GenerationResult {
  success: boolean
  pluginPath: string
  filesGenerated: number
  errors: string[]
}

/**
 * Template function signature
 * All template functions should conform to this interface
 * 
 * @param ctx - Template context with all interpolation variables
 * @returns Generated file content as string
 */
export type TemplateFunction = (ctx: TemplateContext) => string

/**
 * Collection of template functions organized by category
 */
export interface TemplateRegistry {
  // Base files (always generated)
  base: {
    packageJson: TemplateFunction
    tsconfig: TemplateFunction
    readme: TemplateFunction
    npmignore: TemplateFunction
    gitignore: TemplateFunction
  }
  
  // Plugin manifest (always generated)
  manifest: {
    index: TemplateFunction
  }
  
  // Frontend templates (if features.frontend)
  frontend: {
    routes: TemplateFunction
    menu: TemplateFunction
    listPage: TemplateFunction
    formPage: TemplateFunction
    detailPage: TemplateFunction
    widget?: TemplateFunction
  }
  
  // Backend templates (if features.backend)
  backend: {
    edgeFunction: TemplateFunction
  }
  
  // Database templates (if features.database)
  database: {
    migration: TemplateFunction
    seed: TemplateFunction
  }
  
  // Permission templates (if features.permissions)
  permissions: {
    definitions: TemplateFunction
  }
  
  // Translation templates (if features.translations)
  translations: {
    en: TemplateFunction
    th: TemplateFunction
  }
  
  // Event templates (if features.events)
  events: {
    handlers: TemplateFunction
  }
}

