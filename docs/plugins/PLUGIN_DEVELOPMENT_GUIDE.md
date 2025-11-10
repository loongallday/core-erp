# Plugin Development Guide

Complete guide for developing plugins for Core ERP.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Plugin Architecture](#plugin-architecture)
4. [Creating Your First Plugin](#creating-your-first-plugin)
5. [Plugin Manifest](#plugin-manifest)
6. [Frontend Development](#frontend-development)
7. [Backend Development](#backend-development)
8. [Database Integration](#database-integration)
9. [Localization](#localization)
10. [Permissions](#permissions)
11. [Testing](#testing)
12. [Publishing](#publishing)

---

## Introduction

Core ERP's plugin system allows you to extend the platform with custom functionality without modifying the core codebase. Plugins are distributed as private NPM packages and can contribute:

- **Frontend**: Routes, pages, components, menus, widgets
- **Backend**: Edge Functions, data providers, background jobs
- **Database**: Migrations, seed data
- **Permissions**: Custom permissions
- **Translations**: Localized content
- **Events**: Inter-plugin communication

### Key Principles

1. **Core-Controlled**: The core system maintains control over all plugin behavior
2. **Configuration-Driven**: All customization happens via `plugins.config.ts`
3. **Type-Safe**: Full TypeScript support throughout
4. **Isolated**: Plugins are sandboxed for security
5. **Composable**: Plugins can depend on and communicate with other plugins

---

## Prerequisites

### Required Knowledge

- TypeScript
- React 18+ with Hooks
- React Router v6
- Supabase (PostgreSQL, Edge Functions)
- i18next for internationalization

### Required Tools

- Node.js 18+ and npm
- TypeScript 5+
- Git
- Code editor (VS Code recommended)

### Core ERP Setup

Ensure you have Core ERP running locally:

```bash
cd core-erp
npm install
npm run dev
```

---

## Plugin Architecture

### Package Structure

```
@composable-erp/plugin-your-plugin/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                    # Plugin manifest
│   ├── frontend/
│   │   ├── routes.tsx              # Route definitions
│   │   ├── menu.tsx                # Menu items
│   │   ├── pages/                  # React page components
│   │   │   ├── ListPage.tsx
│   │   │   ├── FormPage.tsx
│   │   │   └── DetailPage.tsx
│   │   ├── components/             # Reusable components
│   │   ├── hooks/                  # Custom React hooks
│   │   └── widgets/                # Dashboard widgets
│   ├── backend/
│   │   ├── functions/              # Supabase Edge Functions
│   │   │   └── manage-resource/
│   │   │       └── index.ts
│   │   ├── middleware/             # Request/response middleware
│   │   └── providers/              # Data providers
│   ├── database/
│   │   ├── migrations/             # SQL migration files
│   │   │   └── 001_initial.sql
│   │   └── seeds/                  # Seed data
│   ├── permissions/                # Permission definitions
│   │   └── definitions.json
│   ├── translations/               # Default translations
│   │   ├── en.json
│   │   └── th.json
│   └── events/                     # Event handlers
└── .npmignore
```

### Naming Conventions

- **Package name**: `@composable-erp/plugin-{name}` (lowercase, hyphenated)
- **Plugin ID**: `{name}` (extracted from package name)
- **Files**: PascalCase for components, camelCase for utilities
- **Permissions**: `{plugin-id}:{action}` (e.g., `inventory:create`)
- **Events**: `{plugin-id}:{event}` (e.g., `inventory:item-created`)

---

## Creating Your First Plugin

### Step 1: Initialize Package

```bash
mkdir plugin-inventory
cd plugin-inventory
npm init -y
```

Update `package.json`:

```json
{
  "name": "@composable-erp/plugin-inventory",
  "version": "1.0.0",
  "description": "Inventory management plugin for Core ERP",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src",
    "test": "vitest"
  },
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@composable-erp/plugin-types": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0"
  }
}
```

### Step 2: Setup TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Create Plugin Manifest

Create `src/index.ts`:

```typescript
import { PluginManifest } from '@composable-erp/plugin-types'
import { z } from 'zod'

// Configuration schema
export const configSchema = z.object({
  defaultWarehouse: z.string().default('main'),
  autoReorder: z.boolean().default(false),
  reorderThreshold: z.number().min(0).default(10),
})

export type InventoryConfig = z.infer<typeof configSchema>

// Plugin manifest
export const plugin: PluginManifest = {
  // Basic metadata
  id: 'inventory',
  name: 'Inventory Management',
  version: '1.0.0',
  description: 'Manage inventory items and stock levels',
  author: 'Your Company',
  homepage: 'https://your-docs.com/plugins/inventory',
  license: 'Proprietary',
  category: 'operations',
  tags: ['inventory', 'stock', 'warehouse'],

  // Core compatibility
  coreVersion: '>=1.0.0',

  // Configuration
  config: {
    schema: configSchema,
    defaults: {
      defaultWarehouse: 'main',
      autoReorder: false,
      reorderThreshold: 10,
    },
  },

  // Translations
  translations: {
    namespaces: ['inventory'],
    defaults: {
      en: {
        inventory: () => import('./translations/en.json'),
      },
      th: {
        inventory: () => import('./translations/th.json'),
      },
    },
  },

  // Frontend
  frontend: {
    routes: () => import('./frontend/routes'),
    menu: () => import('./frontend/menu'),
  },

  // Permissions
  permissions: () => import('./permissions/definitions.json'),

  // Lifecycle
  lifecycle: {
    onEnable: async (context) => {
      context.logger.info('Inventory plugin enabled')
    },
    onDisable: async (context) => {
      context.logger.info('Inventory plugin disabled')
    },
  },
}
```

### Step 4: Create Routes

Create `src/frontend/routes.tsx`:

```typescript
import { lazy } from 'react'
import { PluginRoute } from '@composable-erp/plugin-types'

// Lazy load pages for code splitting
const InventoryList = lazy(() => import('./pages/InventoryList'))
const InventoryForm = lazy(() => import('./pages/InventoryForm'))

export default [
  {
    path: '/inventory',
    component: InventoryList,
    requiredPermission: 'inventory:view',
  },
  {
    path: '/inventory/new',
    component: InventoryForm,
    requiredPermission: 'inventory:create',
  },
  {
    path: '/inventory/:id',
    component: InventoryForm,
    requiredPermission: 'inventory:edit',
  },
] as PluginRoute[]
```

### Step 5: Create Menu

Create `src/frontend/menu.tsx`:

```typescript
import { PluginMenuItem } from '@composable-erp/plugin-types'

export default [
  {
    id: 'inventory',
    path: '/inventory',
    label: 'Inventory',
    icon: 'Package',  // Lucide icon name
    permission: 'inventory:view',
    order: 100,
    group: 'operations',
  },
] as PluginMenuItem[]
```

### Step 6: Create Permissions

Create `src/permissions/definitions.json`:

```json
[
  {
    "code": "inventory:view",
    "name": "View Inventory",
    "description": "Can view inventory items and stock levels",
    "category": "inventory"
  },
  {
    "code": "inventory:create",
    "name": "Create Inventory Items",
    "description": "Can create new inventory items",
    "category": "inventory"
  },
  {
    "code": "inventory:edit",
    "name": "Edit Inventory",
    "description": "Can modify inventory items and stock",
    "category": "inventory"
  },
  {
    "code": "inventory:delete",
    "name": "Delete Inventory",
    "description": "Can delete inventory items",
    "category": "inventory"
  }
]
```

### Step 7: Create Translations

Create `src/translations/en.json`:

```json
{
  "title": "Inventory",
  "subtitle": "Manage your inventory and stock levels",
  "items": {
    "list": "Inventory Items",
    "create": "Add Item",
    "edit": "Edit Item",
    "delete": "Delete Item"
  },
  "fields": {
    "name": "Item Name",
    "sku": "SKU",
    "quantity": "Quantity",
    "warehouse": "Warehouse"
  }
}
```

### Step 8: Create a Simple Page

Create `src/frontend/pages/InventoryList.tsx`:

```typescript
import React from 'react'
import { useTranslation } from 'react-i18next'
import { usePluginConfig } from '@composable-erp/plugin-system'
import { InventoryConfig } from '../../index'

export default function InventoryList() {
  const { t } = useTranslation('inventory')
  const config = usePluginConfig<InventoryConfig>('inventory')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('subtitle')}</p>
      
      {config && (
        <div className="mt-4">
          <p>Default Warehouse: {config.defaultWarehouse}</p>
          <p>Auto Reorder: {config.autoReorder ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  )
}
```

### Step 9: Build the Plugin

```bash
npm run build
```

This creates the `dist/` folder with compiled JavaScript and type definitions.

---

## Installing and Testing Locally

### In Core ERP Project

1. **Link the plugin locally**:

```bash
cd core-erp
npm install ../plugin-inventory
```

Or use file protocol in `package.json`:

```json
{
  "dependencies": {
    "@composable-erp/plugin-inventory": "file:../plugin-inventory"
  }
}
```

2. **Configure the plugin** in `plugins.config.ts`:

```typescript
export default {
  plugins: [
    {
      package: '@composable-erp/plugin-inventory',
      enabled: true,
      config: {
        defaultWarehouse: 'main',
        autoReorder: true,
        reorderThreshold: 15,
      },
      localization: {
        en: {
          'inventory.title': 'Stock Management',
        },
      },
      permissions: {
        'inventory:view': ['user', 'manager', 'admin'],
        'inventory:create': ['manager', 'admin'],
        'inventory:edit': ['manager', 'admin'],
        'inventory:delete': ['admin'],
      },
      ui: {
        sidebar: {
          position: 100,
          icon: 'Package',
          label: 'Inventory',
        },
      },
    },
  ],
}
```

3. **Restart the app**:

```bash
npm run dev
```

4. **Access your plugin**:
   - Navigate to `http://localhost:5175/inventory`
   - You should see your inventory page
   - The menu item should appear in the sidebar

---

## Next Steps

Continue reading:

- [Plugin API Reference](./PLUGIN_API_REFERENCE.md) - Complete API documentation
- [Frontend Development](./FRONTEND_DEVELOPMENT.md) - Building UI components
- [Backend Development](./BACKEND_DEVELOPMENT.md) - Edge Functions and APIs
- [Database Integration](./DATABASE_INTEGRATION.md) - Migrations and schemas
- [Localization Guide](./LOCALIZATION_GUIDE.md) - Multi-language support
- [Permission System](./PERMISSION_SYSTEM.md) - Security and access control
- [Event System](./EVENT_SYSTEM.md) - Inter-plugin communication
- [Testing Guide](./TESTING_GUIDE.md) - Unit and integration tests
- [Publishing Guide](./PUBLISHING_GUIDE.md) - Releasing your plugin

---

## Need Help?

- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [Example Plugins](./examples/)
- Consult [Core ERP Documentation](../README.md)

