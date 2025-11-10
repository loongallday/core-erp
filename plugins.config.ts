/**
 * Core ERP Plugin Configuration
 * 
 * This is the central control point for all plugins in your Core ERP deployment.
 * Enable/disable plugins, configure settings, override translations, map permissions,
 * and customize UI behavior for each plugin - all from this single file.
 * 
 * This file allows per-customer customization without modifying plugin code.
 */

import { PluginsConfiguration } from './src/lib/plugin-system/types'

const config: PluginsConfiguration = {
  // =========================================================================
  // GLOBAL PLUGIN SETTINGS
  // =========================================================================
  global: {
    // Enable hot reloading for plugin development
    enableHotReload: process.env.NODE_ENV === 'development',
    
    // Sandbox mode: 'strict' | 'moderate' | 'permissive'
    // - strict: Maximum isolation, strict permission checks
    // - moderate: Balanced security and flexibility
    // - permissive: Minimal restrictions (development only)
    sandboxMode: process.env.NODE_ENV === 'production' ? 'strict' : 'moderate',
    
    // Logging level for plugin system
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    
    // Resource limits per plugin
    maxMemoryPerPlugin: 256,          // MB
    maxExecutionTime: 30,             // Seconds
  },

  // =========================================================================
  // PLUGIN CONFIGURATIONS
  // =========================================================================
  plugins: [
    // Leave Management Plugin
    {
      package: '@composable-erp/core-leave',
      enabled: true,
      config: {
        autoApproveThreshold: 0,
        requireAttachmentDays: 5,
        allowNegativeBalance: false,
        workingDaysOnly: true,
        weekendDays: [0, 6],
        publicHolidays: [],
        notifyApproverEmail: true,
        notifyApproverDaysBefore: 7,
        allowOverlappingRequests: false,
        maxAdvanceBookingDays: 365,
      },
      permissions: {
        'leave:view-own': ['user', 'manager', 'admin', 'superadmin'],
        'leave:create-own': ['user', 'manager', 'admin', 'superadmin'],
        'leave:edit-own': ['user', 'manager', 'admin', 'superadmin'],
        'leave:cancel-own': ['user', 'manager', 'admin', 'superadmin'],
        'leave:view-all': ['manager', 'admin', 'superadmin'],
        'leave:approve': ['manager', 'admin', 'superadmin'],
        'leave:reject': ['manager', 'admin', 'superadmin'],
        'leave:manage-balances': ['admin', 'superadmin'],
        'leave:manage-types': ['admin', 'superadmin'],
        'leave:view-reports': ['manager', 'admin', 'superadmin'],
      },
      ui: {
        sidebar: {
          position: 200,
          icon: 'Calendar',
          label: 'Leave Management',
          group: 'hr',
        },
        dashboard: {
          widgets: ['leave-summary'],
          widgetOrder: [1],
        },
      },
      integration: {
        connectTo: ['core-calendar', 'core-hr', 'core-payroll'],
        dataSharing: {
          'core-calendar': ['leave-dates', 'approval-status'],
          'core-payroll': ['paid-leave-days', 'unpaid-leave-days'],
        },
      },
    },
    
    // EXAMPLE: How to configure a plugin (commented out)
    // -------------------------------------------------------------------------
    // {
    //   // Package name (from npm/private registry/git)
    //   package: '@core-erp/plugin-inventory',
    //   enabled: true,
    //   version: '^2.1.0',
    //   
    //   // Plugin configuration (overrides plugin defaults)
    //   config: {
    //     defaultWarehouse: 'main',
    //     autoReorder: true,
    //     reorderThreshold: 10,
    //     trackSerialNumbers: true,
    //     trackBatchNumbers: false,
    //     enableBarcodeScan: true,
    //     stockValuationMethod: 'FIFO',
    //     notifications: {
    //       lowStockAlert: true,
    //       outOfStockAlert: true,
    //       expiryAlert: true,
    //       alertThresholdDays: 30,
    //     },
    //   },
    //   
    //   // Translation overrides (core controls all text displayed to users)
    //   localization: {
    //     en: {
    //       'inventory.title': 'Stock Management',
    //       'inventory.subtitle': 'Manage your inventory and stock levels',
    //       'inventory.items.create': 'Add New Product',
    //       'warehouse.locations.title': 'Warehouses',
    //     },
    //     th: {
    //       'inventory.title': 'การจัดการสต็อก',
    //       'inventory.subtitle': 'จัดการสินค้าคงคลังและระดับสต็อก',
    //       'inventory.items.create': 'เพิ่มสินค้าใหม่',
    //       'warehouse.locations.title': 'คลังสินค้า',
    //     },
    //   },
    //   
    //   // Feature flags (enable/disable specific plugin features)
    //   features: {
    //     'barcode-scanning': true,
    //     'batch-tracking': false,
    //     'serial-numbers': true,
    //     'expiry-dates': true,
    //     'multi-warehouse': true,
    //     'stock-transfer': true,
    //     'auto-reorder': true,
    //     'demand-forecasting': false,
    //     'integration-accounting': true,
    //     'dashboard-widget': true,
    //     'reports-module': true,
    //     'mobile-app': false,
    //   },
    //   
    //   // Permission mappings (assign plugin permissions to core roles)
    //   permissions: {
    //     'inventory:view': ['user', 'manager', 'admin', 'superadmin'],
    //     'inventory:create': ['manager', 'admin', 'superadmin'],
    //     'inventory:edit': ['manager', 'admin', 'superadmin'],
    //     'inventory:delete': ['admin', 'superadmin'],
    //     'inventory:adjust-stock': ['manager', 'admin', 'superadmin'],
    //     'inventory:transfer': ['manager', 'admin', 'superadmin'],
    //     'inventory:view-reports': ['manager', 'admin', 'superadmin'],
    //   },
    //   
    //   // UI customization
    //   ui: {
    //     // Theme colors
    //     theme: {
    //       primaryColor: '#10b981',
    //       accentColor: '#059669',
    //       iconColor: '#047857',
    //     },
    //     
    //     // Sidebar menu configuration
    //     sidebar: {
    //       position: 100,              // Order in menu (lower = higher)
    //       icon: 'package',            // Lucide icon name
    //       label: 'Inventory',         // Custom label (overrides plugin default)
    //       group: 'operations',        // Menu group
    //     },
    //     
    //     // Dashboard widgets
    //     dashboard: {
    //       widgets: ['inventory-summary', 'low-stock-alert', 'recent-movements'],
    //       widgetOrder: [1, 2, 3],
    //     },
    //     
    //     // Custom CSS (optional)
    //     customStyles: `
    //       .inventory-item {
    //         border-left: 3px solid #10b981;
    //       }
    //     `,
    //   },
    //   
    //   // Integration with other plugins
    //   integration: {
    //     connectTo: ['plugin-sales', 'plugin-purchasing', 'plugin-accounting'],
    //     dataSharing: {
    //       'plugin-sales': ['product-info', 'stock-levels', 'availability'],
    //       'plugin-purchasing': ['stock-levels', 'reorder-points'],
    //       'plugin-accounting': ['inventory-valuation', 'cogs'],
    //     },
    //   },
    //   
    //   // Lifecycle hooks (core-defined callbacks)
    //   hooks: {
    //     onEnable: async () => {
    //       console.log('Inventory plugin enabled')
    //       // Custom initialization logic
    //     },
    //     onDisable: async () => {
    //       console.log('Inventory plugin disabled')
    //       // Custom cleanup logic
    //     },
    //     beforeLoad: async () => {
    //       // Pre-load checks
    //     },
    //     afterLoad: async () => {
    //       // Post-load setup
    //     },
    //   },
    //   
    //   // Rate limiting (operations per minute)
    //   rateLimits: {
    //     'api-calls': 1000,
    //     'database-queries': 5000,
    //     'background-jobs': 60,
    //   },
    // },

    // -------------------------------------------------------------------------
    // Add your plugins here when ready
    // -------------------------------------------------------------------------
    // Example: Install from npm
    // {
    //   package: '@core-erp/plugin-crm',
    //   enabled: true,
    //   config: { /* ... */ },
    // },

    // Example: Install from git repository
    // {
    //   package: 'git+ssh://git@github.com:your-org/plugin-custom.git#v1.0.0',
    //   enabled: true,
    //   config: { /* ... */ },
    // },

    // Example: Local development (file: protocol)
    // {
    //   package: 'file:../my-plugin',
    //   enabled: true,
    //   config: { /* ... */ },
    // },
  ],
}

export default config

/* ============================================================================
 * PLUGIN CONFIGURATION GUIDE
 * ============================================================================
 *
 * QUICK START
 * 
 * 1. Install a plugin:
 *    npm install @core-erp/plugin-inventory
 * 
 * 2. Add configuration to plugins array above:
 *    {
 *      package: '@core-erp/plugin-inventory',
 *      enabled: true,
 *      config: { // plugin-specific settings }
 *    }
 * 
 * 3. Restart the application:
 *    npm run dev
 * 
 * 4. The plugin is now active and integrated!
 *
 * ----------------------------------------------------------------------------
 * CONFIGURATION PRIORITIES
 * 
 * When a plugin is loaded, configuration is merged in this order:
 * 1. Plugin defaults (from plugin package)
 * 2. Core configuration (from this file) ← HIGHEST PRIORITY
 * 
 * This means you can override any plugin setting from this file.
 *
 * ----------------------------------------------------------------------------
 * LOCALIZATION OVERRIDES
 * 
 * Override any translation key for any plugin:
 * 
 * localization: {
 *   en: {
 *     'plugin-namespace.key': 'Your Custom Text',
 *   },
 *   th: {
 *     'plugin-namespace.key': 'ข้อความที่กำหนดเอง',
 *   },
 * }
 * 
 * This is perfect for:
 * - Customer-specific terminology
 * - Industry-specific terms
 * - Rebranding
 * - Localization improvements
 *
 * ----------------------------------------------------------------------------
 * FEATURE FLAGS
 * 
 * Enable or disable specific plugin features without code changes:
 * 
 * features: {
 *   'feature-name': true,   // Enable
 *   'other-feature': false,  // Disable
 * }
 * 
 * Use this for:
 * - A/B testing
 * - Gradual rollout
 * - Customer-specific features
 * - License-based feature control
 *
 * ----------------------------------------------------------------------------
 * PERMISSION MAPPING
 * 
 * Map plugin permissions to your existing roles:
 * 
 * permissions: {
 *   'plugin:action': ['role1', 'role2'],
 * }
 * 
 * This integrates plugin permissions with your existing RBAC system.
 *
 * ----------------------------------------------------------------------------
 * UI CUSTOMIZATION
 * 
 * Control how plugins appear in the UI:
 * - Change menu labels and icons
 * - Reorder menu items
 * - Customize colors
 * - Control widget placement
 * - Apply custom CSS
 * 
 * All from this configuration file!
 *
 * ----------------------------------------------------------------------------
 * INTEGRATION
 * 
 * Connect plugins together:
 * 
 * integration: {
 *   connectTo: ['other-plugin-id'],
 *   dataSharing: {
 *     'other-plugin-id': ['data-key-1', 'data-key-2'],
 *   },
 * }
 * 
 * This enables inter-plugin communication and data sharing.
 *
 * ----------------------------------------------------------------------------
 * ENVIRONMENT-SPECIFIC CONFIGURATION
 * 
 * You can use environment variables for different configurations:
 * 
 * config: {
 *   apiKey: process.env.PLUGIN_API_KEY,
 *   debug: process.env.NODE_ENV === 'development',
 * }
 *
 * ----------------------------------------------------------------------------
 * DISABLING PLUGINS
 * 
 * To temporarily disable a plugin without uninstalling:
 * 
 * {
 *   package: '@core-erp/plugin-name',
 *   enabled: false,
 * }
 * 
 * The plugin remains installed but won't load or affect the system.
 * ============================================================================
 */

