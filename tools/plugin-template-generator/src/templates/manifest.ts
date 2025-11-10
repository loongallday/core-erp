/**
 * Core ERP Plugin Template Generator - Manifest Template
 * 
 * This module contains the template for the plugin manifest file (src/index.ts).
 * The manifest is the main entry point that defines all plugin capabilities,
 * configuration, and metadata.
 */

import { TemplateContext } from '../types.js'

/**
 * Generates the plugin manifest (src/index.ts)
 * 
 * Creates the main plugin entry point with:
 * - Plugin metadata (name, version, description, etc.)
 * - Configuration schema with Zod
 * - References to all plugin capabilities (frontend, backend, etc.)
 * - Lifecycle hooks
 * 
 * This is the most important file in the plugin - it defines everything
 * the Core ERP system needs to know about the plugin.
 * 
 * @param ctx - Template context
 * @returns src/index.ts content
 */
export function manifestTemplate(ctx: TemplateContext): string {
  return `/**
 * ${ctx.pluginName} Plugin for Core ERP
 * 
 * ${ctx.description}
 * 
 * @author ${ctx.author}
 * @version 1.0.0
 * @category ${ctx.category}
 */

import { PluginManifest } from '@core-erp/plugin-types'
import { z } from 'zod'

// ============================================================================
// CONFIGURATION SCHEMA
// ============================================================================

/**
 * Plugin configuration schema
 * Define all configurable options for your plugin here
 */
export const configSchema = z.object({
  // Example configuration options
  enabled: z.boolean().default(true),
  maxItems: z.number().min(1).max(1000).default(100),
  autoRefresh: z.boolean().default(false),
  
  // Add your plugin-specific configuration here
})

export type ${ctx.pluginIdPascal}Config = z.infer<typeof configSchema>

// ============================================================================
// PLUGIN MANIFEST
// ============================================================================

/**
 * Main plugin manifest
 * This is the entry point that Core ERP uses to load and configure the plugin
 */
export const plugin: PluginManifest = {
  // Basic metadata
  id: '${ctx.pluginId}',
  name: '${ctx.pluginName}',
  version: '1.0.0',
  description: '${ctx.description}',
  author: '${ctx.author}',
  homepage: 'https://your-docs.com/plugins/${ctx.pluginId}',
  license: 'PROPRIETARY',
  category: '${ctx.category}',
  tags: ['${ctx.category}', '${ctx.resourceNameLower}', 'management'],

  // Core version compatibility (semver range)
  coreVersion: '>=1.0.0',

  // Configuration
  config: {
    schema: configSchema,
    defaults: {
      enabled: true,
      maxItems: 100,
      autoRefresh: false,
    },
  },
${ctx.features.translations ? `
  // Translations
  translations: {
    namespaces: ['${ctx.pluginId}'],
    defaults: {
      en: {
        '${ctx.pluginId}': () => import('./translations/en.json'),
      },
      th: {
        '${ctx.pluginId}': () => import('./translations/th.json'),
      },
    },
  },
` : ''}${ctx.features.frontend ? `
  // Frontend capabilities
  frontend: {
    routes: () => import('./frontend/routes'),
    menu: () => import('./frontend/menu'),${ctx.features.widgets ? `
    widgets: () => import('./frontend/widgets/${ctx.pluginIdPascal}Widget'),` : ''}
  },
` : ''}${ctx.features.backend ? `
  // Backend capabilities
  backend: {
    functions: () => import('./backend/functions/manage-${ctx.resourceNameLowerPlural}/index'),
  },
` : ''}${ctx.features.database ? `
  // Database capabilities
  database: {
    migrations: () => import('./database/migrations/001_initial.sql'),
    seeds: () => import('./database/seeds/sample_data.sql'),
  },
` : ''}${ctx.features.permissions ? `
  // Permissions
  permissions: () => import('./permissions/definitions.json'),
` : ''}${ctx.features.events ? `
  // Events
  events: {
    emits: [
      '${ctx.pluginId}:${ctx.resourceNameLower}-created',
      '${ctx.pluginId}:${ctx.resourceNameLower}-updated',
      '${ctx.pluginId}:${ctx.resourceNameLower}-deleted',
    ],
    listens: {
      'core:user-logged-in': () => import('./events/handlers'),
    },
  },
` : ''}
  // Lifecycle hooks
  lifecycle: {
    /**
     * Called when plugin is installed
     */
    onInstall: async (context) => {
      context.logger.info('${ctx.pluginName} plugin installed')
      // Add installation logic here (e.g., initial setup, create default data)
    },

    /**
     * Called when plugin is enabled
     */
    onEnable: async (context) => {
      context.logger.info('${ctx.pluginName} plugin enabled')
      // Add enable logic here (e.g., start background jobs, subscribe to events)
    },

    /**
     * Called when plugin is disabled
     */
    onDisable: async (context) => {
      context.logger.info('${ctx.pluginName} plugin disabled')
      // Add disable logic here (e.g., stop background jobs, cleanup)
    },

    /**
     * Called when plugin is uninstalled
     */
    onUninstall: async (context) => {
      context.logger.info('${ctx.pluginName} plugin uninstalled')
      // Add uninstall logic here (e.g., cleanup data, remove migrations)
    },

    /**
     * Called when plugin configuration changes
     */
    onConfigChange: async (oldConfig, newConfig) => {
      console.log('Configuration changed from:', oldConfig, 'to:', newConfig)
      // Handle configuration changes here
    },

    /**
     * Called before plugin starts loading
     */
    beforeStart: async (context) => {
      context.logger.debug('${ctx.pluginName} plugin starting...')
      // Pre-start checks and preparation
    },

    /**
     * Called after plugin has fully loaded
     */
    afterStart: async (context) => {
      context.logger.info('${ctx.pluginName} plugin started successfully')
      // Post-start initialization
    },
  },

  /**
   * Health check function
   * Called periodically to verify plugin is functioning correctly
   */
  healthCheck: async () => {
    // Implement health checks here
    // For example: database connectivity, API availability, etc.
    
    return {
      healthy: true,
      message: '${ctx.pluginName} is operating normally',
      details: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    }
  },
}

// Export config type for use in other files
export default plugin
`
}

