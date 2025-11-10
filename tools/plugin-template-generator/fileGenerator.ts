/**
 * File Generator - Template Functions for Plugin Generation
 * 
 * This module contains all template functions that generate the actual file content
 * for plugin packages. Each function receives plugin metadata and returns the file
 * content as a string.
 * 
 * TEMPLATE DEVELOPMENT GUIDE:
 * ---------------------------
 * Each template function follows this pattern:
 * 1. Receives PluginMetadata as parameter
 * 2. Destructures needed properties
 * 3. Returns string content (usually template literal)
 * 4. Uses consistent indentation (2 spaces)
 * 5. Includes helpful comments in generated code
 * 
 * @see TEMPLATE_DEVELOPMENT.md for detailed guide on creating new templates
 */

import { PluginMetadata, GeneratedFile } from './types.js'

// =============================================================================
// BASE FILES
// =============================================================================

/**
 * Generates package.json for the plugin
 * 
 * This is the npm package manifest for the plugin. It defines:
 * - Package name and version
 * - Dependencies and peer dependencies
 * - Build scripts
 * - Entry points
 * 
 * @param meta - Plugin metadata
 * @returns package.json content
 */
export function generatePackageJson(meta: PluginMetadata): string {
  return `{
  "name": "${meta.packageName}",
  "version": "1.0.0",
  "description": "${meta.description}",
  "author": "${meta.author}",
  "license": "Proprietary",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "echo \\"No tests yet\\" && exit 0"
  },
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.8.0",
    "eslint": "^9.0.0"
  },
  "keywords": [
    "core-erp",
    "plugin",
    "${meta.category}",
    "${meta.id}"
  ]
}
`
}

/**
 * Generates tsconfig.json for TypeScript compilation
 * 
 * @param _meta - Plugin metadata
 * @returns tsconfig.json content
 */
export function generateTsConfig(_meta: PluginMetadata): string {
  return `{
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
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`
}

/**
 * Generates .npmignore file
 * 
 * @param _meta - Plugin metadata
 * @returns .npmignore content
 */
export function generateNpmIgnore(_meta: PluginMetadata): string {
  return `# Source files
src/
tsconfig.json

# Development files
*.log
*.map
.DS_Store
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/
*.test.ts
*.test.tsx
`
}

/**
 * Generates README.md for the plugin
 * 
 * This provides documentation for the plugin package including:
 * - Overview and features
 * - Installation instructions
 * - Configuration examples
 * - Development guide
 * 
 * @param meta - Plugin metadata
 * @returns README.md content
 */
export function generateReadme(meta: PluginMetadata): string {
  const features: string[] = []
  if (meta.features.frontend) features.push('- Frontend routes and pages')
  if (meta.features.menu) features.push('- Sidebar menu integration')
  if (meta.features.widgets) features.push('- Dashboard widgets')
  if (meta.features.backend) features.push('- Backend Edge Functions')
  if (meta.features.database) features.push('- Database migrations')
  if (meta.features.permissions) features.push('- Permission definitions')
  if (meta.features.translations) features.push('- Multi-language support (EN, TH)')
  if (meta.features.events) features.push('- Event handlers')
  
  return `# ${meta.name}

${meta.description}

## Overview

This plugin extends Core ERP with ${meta.resourceNameKebab} management capabilities.

## Features

${features.join('\n')}

## Installation

\`\`\`bash
# Install the plugin
npm install ${meta.packageName}
\`\`\`

## Configuration

Add to \`plugins.config.ts\`:

\`\`\`typescript
export default {
  plugins: [
    {
      package: '${meta.packageName}',
      enabled: true,
      config: {
        // Add your configuration here
      },
      permissions: {
        '${meta.id}:view': ['user', 'manager', 'admin'],
        '${meta.id}:create': ['manager', 'admin'],
        '${meta.id}:edit': ['manager', 'admin'],
        '${meta.id}:delete': ['admin'],
      },
    },
  ],
}
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Lint
npm run lint
\`\`\`

## Usage

${meta.features.frontend ? `
### Frontend

The plugin adds routes for ${meta.resourceNameKebab} management:

- \`/${meta.resourceNameKebabPlural}\` - List all ${meta.resourceNameKebabPlural}
- \`/${meta.resourceNameKebabPlural}/new\` - Create new ${meta.resourceNameKebab}
- \`/${meta.resourceNameKebabPlural}/:id\` - View/edit ${meta.resourceNameKebab}
` : ''}

${meta.features.database ? `
### Database

Run migrations to create the required tables:

\`\`\`sql
-- See src/database/migrations/ for SQL
\`\`\`
` : ''}

${meta.features.permissions ? `
### Permissions

Available permissions:

- \`${meta.id}:view\` - View ${meta.resourceNameKebabPlural}
- \`${meta.id}:create\` - Create ${meta.resourceNameKebabPlural}
- \`${meta.id}:edit\` - Edit ${meta.resourceNameKebabPlural}
- \`${meta.id}:delete\` - Delete ${meta.resourceNameKebabPlural}
` : ''}

## License

Proprietary - ${meta.author}

## Author

${meta.author} (${meta.year})
`
}

// =============================================================================
// PLUGIN MANIFEST
// =============================================================================

/**
 * Generates the main plugin manifest (src/index.ts)
 * 
 * This is the entry point of the plugin. It exports the PluginManifest object
 * that defines all plugin capabilities, configuration, and hooks.
 * 
 * @param meta - Plugin metadata
 * @returns Plugin manifest content
 */
export function generateManifest(meta: PluginMetadata): string {
  return `/**
 * ${meta.name} Plugin for Core ERP
 * 
 * @author ${meta.author}
 * @version 1.0.0
 */

import { PluginManifest } from '@core-erp/plugin-types'
import { z } from 'zod'

// =============================================================================
// CONFIGURATION SCHEMA
// =============================================================================

/**
 * Configuration schema for ${meta.name}
 * 
 * Define your plugin's configuration options here using Zod.
 * These can be overridden by the core system in plugins.config.ts.
 */
export const configSchema = z.object({
  // Example configuration
  enabled: z.boolean().default(true),
  // Add more configuration options as needed
})

export type ${meta.resourceName}PluginConfig = z.infer<typeof configSchema>

// =============================================================================
// PLUGIN MANIFEST
// =============================================================================

/**
 * Main plugin manifest
 * 
 * This object defines all capabilities and hooks for the plugin.
 * The core system reads this to understand what the plugin provides.
 */
export const plugin: PluginManifest = {
  // ---------------------------------------------------------------------------
  // Basic Metadata
  // ---------------------------------------------------------------------------
  id: '${meta.id}',
  name: '${meta.name}',
  version: '1.0.0',
  description: '${meta.description}',
  author: '${meta.author}',
  license: 'Proprietary',
  category: '${meta.category}',
  tags: ['${meta.category}', '${meta.resourceNameKebab}'],

  // ---------------------------------------------------------------------------
  // Core Compatibility
  // ---------------------------------------------------------------------------
  coreVersion: '>=1.0.0',

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  config: {
    schema: configSchema,
    defaults: {
      enabled: true,
    },
  },
${meta.features.translations ? `
  // ---------------------------------------------------------------------------
  // Translations
  // ---------------------------------------------------------------------------
  translations: {
    namespaces: ['${meta.id}'],
    defaults: {
      en: {
        '${meta.id}': () => import('./translations/en.json'),
      },
      th: {
        '${meta.id}': () => import('./translations/th.json'),
      },
    },
  },
` : ''}${meta.features.frontend || meta.features.menu || meta.features.widgets ? `
  // ---------------------------------------------------------------------------
  // Frontend Capabilities
  // ---------------------------------------------------------------------------
  frontend: {${meta.features.frontend ? `
    routes: () => import('./frontend/routes'),` : ''}${meta.features.menu ? `
    menu: () => import('./frontend/menu'),` : ''}${meta.features.widgets ? `
    widgets: () => import('./frontend/widgets'),` : ''}
  },
` : ''}${meta.features.backend ? `
  // ---------------------------------------------------------------------------
  // Backend Capabilities
  // ---------------------------------------------------------------------------
  backend: {
    functions: () => import('./backend/functions'),
  },
` : ''}${meta.features.database ? `
  // ---------------------------------------------------------------------------
  // Database Capabilities
  // ---------------------------------------------------------------------------
  database: {
    migrations: () => import('./database/migrations'),
  },
` : ''}${meta.features.permissions ? `
  // ---------------------------------------------------------------------------
  // Permissions
  // ---------------------------------------------------------------------------
  permissions: () => import('./permissions/definitions.json'),
` : ''}${meta.features.events ? `
  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  events: {
    emits: ['${meta.id}:${meta.resourceNameKebab}-created', '${meta.id}:${meta.resourceNameKebab}-updated', '${meta.id}:${meta.resourceNameKebab}-deleted'],
    listens: {
      'core:user-logged-in': () => import('./events/handlers'),
    },
  },
` : ''}
  // ---------------------------------------------------------------------------
  // Lifecycle Hooks
  // ---------------------------------------------------------------------------
  lifecycle: {
    onEnable: async (context) => {
      context.logger.info('${meta.name} enabled')
    },
    onDisable: async (context) => {
      context.logger.info('${meta.name} disabled')
    },
    onInstall: async (context) => {
      context.logger.info('${meta.name} installed')
    },
  },

  // ---------------------------------------------------------------------------
  // Health Check
  // ---------------------------------------------------------------------------
  healthCheck: async () => {
    return {
      healthy: true,
      message: '${meta.name} is running',
      lastCheck: new Date(),
    }
  },
}
`
}

// =============================================================================
// FRONTEND TEMPLATES
// =============================================================================

/**
 * Generates frontend routes configuration
 * 
 * @param meta - Plugin metadata
 * @returns Routes configuration content
 */
export function generateRoutes(meta: PluginMetadata): string {
  return `/**
 * Route Definitions for ${meta.name}
 * 
 * This file defines all frontend routes provided by this plugin.
 * Routes are automatically registered by the core plugin system.
 */

import { lazy } from 'react'
import { PluginRoute } from '@core-erp/plugin-types'

// Lazy load pages for code splitting
const ${meta.resourceNamePlural}List = lazy(() => import('./pages/${meta.resourceNamePlural}List'))
const ${meta.resourceName}Form = lazy(() => import('./pages/${meta.resourceName}Form'))
const ${meta.resourceName}Detail = lazy(() => import('./pages/${meta.resourceName}Detail'))

/**
 * Plugin routes
 * 
 * These routes will be added to the main React Router configuration.
 * Each route can specify required permissions for access control.
 */
export default [
  {
    path: '/${meta.resourceNameKebabPlural}',
    component: ${meta.resourceNamePlural}List,
    requiredPermission: '${meta.id}:view',
  },
  {
    path: '/${meta.resourceNameKebabPlural}/new',
    component: ${meta.resourceName}Form,
    requiredPermission: '${meta.id}:create',
  },
  {
    path: '/${meta.resourceNameKebabPlural}/:id',
    component: ${meta.resourceName}Detail,
    requiredPermission: '${meta.id}:view',
  },
  {
    path: '/${meta.resourceNameKebabPlural}/:id/edit',
    component: ${meta.resourceName}Form,
    requiredPermission: '${meta.id}:edit',
  },
] as PluginRoute[]
`
}

/**
 * Generates menu items configuration
 * 
 * @param meta - Plugin metadata
 * @returns Menu configuration content
 */
export function generateMenu(meta: PluginMetadata): string {
  return `/**
 * Menu Items for ${meta.name}
 * 
 * This file defines menu items that will appear in the application sidebar.
 */

import { PluginMenuItem } from '@core-erp/plugin-types'

/**
 * Plugin menu items
 * 
 * These will be added to the main navigation menu.
 * The order determines where they appear in the menu.
 */
export default [
  {
    id: '${meta.id}',
    path: '/${meta.resourceNameKebabPlural}',
    label: '${meta.name}',
    icon: 'Package', // Lucide icon name
    permission: '${meta.id}:view',
    order: 100,
    group: '${meta.category}',
  },
] as PluginMenuItem[]
`
}

/**
 * Generates List page component
 * 
 * @param meta - Plugin metadata
 * @returns List page component content
 */
export function generateListPage(meta: PluginMetadata): string {
  return `/**
 * ${meta.resourceNamePlural} List Page
 * 
 * This page displays a table of all ${meta.resourceNameKebabPlural} with search,
 * filter, and pagination capabilities.
 */

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

// TODO: Replace with actual API hook
function use${meta.resourceNamePlural}() {
  return {
    data: [],
    isLoading: false,
    error: null,
  }
}

export default function ${meta.resourceNamePlural}List() {
  const { t } = useTranslation('${meta.id}')
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: ${meta.resourceNameCamelPlural}, isLoading, error } = use${meta.resourceNamePlural}()
  
  // Filter items based on search query
  const filtered${meta.resourceNamePlural} = ${meta.resourceNameCamelPlural}?.filter((item: any) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []
  
  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }
  
  if (error) {
    return <div className="p-6 text-red-600">Error loading ${meta.resourceNameKebabPlural}</div>
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        
        {hasPermission('${meta.id}:create') && (
          <Button onClick={() => navigate('/${meta.resourceNameKebabPlural}/new')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.create')}
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('list.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fields.name')}</TableHead>
                <TableHead>{t('fields.description')}</TableHead>
                <TableHead>{t('fields.created_at')}</TableHead>
                <TableHead className="text-right">{t('fields.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered${meta.resourceNamePlural}.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {t('list.no_items')}
                  </TableCell>
                </TableRow>
              ) : (
                filtered${meta.resourceNamePlural}.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission('${meta.id}:edit') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(\`/${meta.resourceNameKebabPlural}/\${item.id}/edit\`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {hasPermission('${meta.id}:delete') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement delete with confirmation
                              console.log('Delete', item.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
`
}

/**
 * Generates Form page component
 * 
 * @param meta - Plugin metadata
 * @returns Form page component content
 */
export function generateFormPage(meta: PluginMetadata): string {
  return `/**
 * ${meta.resourceName} Form Page
 * 
 * This page handles creation and editing of ${meta.resourceNameKebabPlural}.
 * It uses React Hook Form with Zod validation.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function ${meta.resourceName}Form() {
  const { t } = useTranslation('${meta.id}')
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })
  
  // TODO: Load existing data if editing
  // useEffect(() => {
  //   if (id) {
  //     // Load data for editing
  //   }
  // }, [id])
  
  async function onSubmit(values: FormValues) {
    try {
      // TODO: Call API to create/update
      console.log('Submitting:', values)
      
      toast.success(
        isEditing
          ? t('messages.updated_success')
          : t('messages.created_success')
      )
      
      navigate('/${meta.resourceNameKebabPlural}')
    } catch (error) {
      toast.error(t('messages.error'))
      console.error(error)
    }
  }
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEditing ? t('form.edit_title') : t('form.create_title')}
        </h1>
        <p className="text-muted-foreground">{t('form.description')}</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? t('form.edit') : t('form.create')}</CardTitle>
          <CardDescription>{t('form.fill_details')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('fields.name_placeholder')} {...field} />
                    </FormControl>
                    <FormDescription>{t('fields.name_description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('fields.description_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('fields.description_description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4">
                <Button type="submit">
                  {isEditing ? t('actions.save') : t('actions.create')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/${meta.resourceNameKebabPlural}')}
                >
                  {t('actions.cancel')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
`
}

/**
 * Generates Detail page component
 * 
 * @param meta - Plugin metadata
 * @returns Detail page component content
 */
export function generateDetailPage(meta: PluginMetadata): string {
  return `/**
 * ${meta.resourceName} Detail Page
 * 
 * This page displays detailed information about a single ${meta.resourceNameKebab}.
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export default function ${meta.resourceName}Detail() {
  const { t } = useTranslation('${meta.id}')
  const navigate = useNavigate()
  const { id } = useParams()
  const { hasPermission } = useAuth()
  
  // TODO: Load data for this specific item
  const ${meta.resourceNameCamel} = {
    id,
    name: 'Sample ${meta.resourceName}',
    description: 'This is a sample description',
    created_at: new Date().toISOString(),
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/${meta.resourceNameKebabPlural}')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('actions.back')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{${meta.resourceNameCamel}.name}</h1>
            <p className="text-muted-foreground">{t('detail.subtitle')}</p>
          </div>
        </div>
        
        {hasPermission('${meta.id}:edit') && (
          <Button onClick={() => navigate(\`/${meta.resourceNameKebabPlural}/\${id}/edit\`)}>
            <Edit className="mr-2 h-4 w-4" />
            {t('actions.edit')}
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('detail.information')}</CardTitle>
          <CardDescription>{t('detail.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('fields.name')}</label>
            <p className="text-lg">{${meta.resourceNameCamel}.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium">{t('fields.description')}</label>
            <p>{${meta.resourceNameCamel}.description || t('detail.no_description')}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium">{t('fields.created_at')}</label>
            <p>{new Date(${meta.resourceNameCamel}.created_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
`
}

// =============================================================================
// BACKEND TEMPLATES
// =============================================================================

/**
 * Generates Edge Function for CRUD operations
 * 
 * @param meta - Plugin metadata
 * @returns Edge Function content
 */
export function generateEdgeFunction(meta: PluginMetadata): string {
  return `/**
 * ${meta.name} - Manage ${meta.resourceNamePlural} Edge Function
 * 
 * This Supabase Edge Function handles CRUD operations for ${meta.resourceNameKebabPlural}.
 * It uses the service role key to bypass RLS and perform admin operations.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ${meta.resourceName} {
  id?: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization token
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const url = new URL(req.url)
    const method = req.method
    const id = url.searchParams.get('id')

    // Route to appropriate handler
    if (method === 'GET') {
      if (id) {
        // Get single ${meta.resourceNameKebab}
        const { data, error } = await supabase
          .from('${meta.resourceNameSnakePlural}')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Get all ${meta.resourceNameKebabPlural}
        const { data, error } = await supabase
          .from('${meta.resourceNameSnakePlural}')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify({ data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (method === 'POST') {
      // Create new ${meta.resourceNameKebab}
      const body: ${meta.resourceName} = await req.json()

      const { data, error } = await supabase
        .from('${meta.resourceNameSnakePlural}')
        .insert({
          name: body.name,
          description: body.description,
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (method === 'PUT' || method === 'PATCH') {
      // Update ${meta.resourceNameKebab}
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'ID required for update' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const body: Partial<${meta.resourceName}> = await req.json()

      const { data, error } = await supabase
        .from('${meta.resourceNameSnakePlural}')
        .update({
          name: body.name,
          description: body.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (method === 'DELETE') {
      // Delete ${meta.resourceNameKebab}
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'ID required for delete' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabase
        .from('${meta.resourceNameSnakePlural}')
        .delete()
        .eq('id', id)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
`
}

// =============================================================================
// DATABASE TEMPLATES
// =============================================================================

/**
 * Generates database migration SQL
 * 
 * @param meta - Plugin metadata
 * @returns Migration SQL content
 */
export function generateMigration(meta: PluginMetadata): string {
  return `-- ${meta.name} - Initial Migration
-- Creates table for ${meta.resourceNameKebabPlural} with RLS policies

-- Create ${meta.resourceNameSnakePlural} table
CREATE TABLE IF NOT EXISTS ${meta.resourceNameSnakePlural} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_${meta.resourceNameSnakePlural}_name ON ${meta.resourceNameSnakePlural}(name);
CREATE INDEX idx_${meta.resourceNameSnakePlural}_created_at ON ${meta.resourceNameSnakePlural}(created_at);

-- Enable Row Level Security
ALTER TABLE ${meta.resourceNameSnakePlural} ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to view ${meta.resourceNameKebabPlural}
CREATE POLICY "${meta.resourceNameSnakePlural}_select_policy"
  ON ${meta.resourceNameSnakePlural}
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert ${meta.resourceNameKebabPlural}
CREATE POLICY "${meta.resourceNameSnakePlural}_insert_policy"
  ON ${meta.resourceNameSnakePlural}
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update ${meta.resourceNameKebabPlural}
CREATE POLICY "${meta.resourceNameSnakePlural}_update_policy"
  ON ${meta.resourceNameSnakePlural}
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete ${meta.resourceNameKebabPlural}
CREATE POLICY "${meta.resourceNameSnakePlural}_delete_policy"
  ON ${meta.resourceNameSnakePlural}
  FOR DELETE
  TO authenticated
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_${meta.resourceNameSnakePlural}_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ${meta.resourceNameSnakePlural}_updated_at
  BEFORE UPDATE ON ${meta.resourceNameSnakePlural}
  FOR EACH ROW
  EXECUTE FUNCTION update_${meta.resourceNameSnakePlural}_updated_at();

-- Seed sample data (optional)
INSERT INTO ${meta.resourceNameSnakePlural} (name, description) VALUES
  ('Sample ${meta.resourceName} 1', 'This is a sample ${meta.resourceNameKebab}'),
  ('Sample ${meta.resourceName} 2', 'Another example ${meta.resourceNameKebab}');

-- Grant necessary permissions
GRANT ALL ON ${meta.resourceNameSnakePlural} TO authenticated;
GRANT ALL ON ${meta.resourceNameSnakePlural} TO service_role;
`
}

// =============================================================================
// PERMISSIONS TEMPLATE
// =============================================================================

/**
 * Generates permissions definitions JSON
 * 
 * @param meta - Plugin metadata
 * @returns Permissions JSON content
 */
export function generatePermissions(meta: PluginMetadata): string {
  const permissions = [
    {
      code: `${meta.id}:view`,
      name: `View ${meta.name}`,
      description: `Can view ${meta.resourceNameKebabPlural}`,
      category: meta.id,
    },
    {
      code: `${meta.id}:create`,
      name: `Create ${meta.resourceNamePlural}`,
      description: `Can create new ${meta.resourceNameKebabPlural}`,
      category: meta.id,
    },
    {
      code: `${meta.id}:edit`,
      name: `Edit ${meta.resourceNamePlural}`,
      description: `Can modify ${meta.resourceNameKebabPlural}`,
      category: meta.id,
    },
    {
      code: `${meta.id}:delete`,
      name: `Delete ${meta.resourceNamePlural}`,
      description: `Can delete ${meta.resourceNameKebabPlural}`,
      category: meta.id,
    },
  ]
  
  return JSON.stringify(permissions, null, 2)
}

// =============================================================================
// TRANSLATION TEMPLATES
// =============================================================================

/**
 * Generates English translations JSON
 * 
 * @param meta - Plugin metadata
 * @returns English translations content
 */
export function generateTranslationsEN(meta: PluginMetadata): string {
  const translations = {
    title: meta.name,
    subtitle: meta.description,
    list: {
      title: `All ${meta.resourceNamePlural}`,
      description: `Manage your ${meta.resourceNameKebabPlural}`,
      search_placeholder: 'Search...',
      no_items: `No ${meta.resourceNameKebabPlural} found`,
    },
    form: {
      create_title: `Create ${meta.resourceName}`,
      edit_title: `Edit ${meta.resourceName}`,
      description: 'Fill in the details below',
      create: `Create ${meta.resourceName}`,
      edit: `Edit ${meta.resourceName}`,
      fill_details: 'Fill in the details',
    },
    detail: {
      subtitle: `${meta.resourceName} details`,
      information: 'Information',
      description: `View ${meta.resourceNameKebab} details`,
      no_description: 'No description provided',
    },
    fields: {
      name: 'Name',
      name_placeholder: `Enter ${meta.resourceNameKebab} name`,
      name_description: `The name of the ${meta.resourceNameKebab}`,
      description: 'Description',
      description_placeholder: 'Enter description',
      description_description: 'Optional description',
      created_at: 'Created',
      updated_at: 'Updated',
      actions: 'Actions',
    },
    actions: {
      create: 'Create',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      back: 'Back',
    },
    messages: {
      created_success: `${meta.resourceName} created successfully`,
      updated_success: `${meta.resourceName} updated successfully`,
      deleted_success: `${meta.resourceName} deleted successfully`,
      error: 'An error occurred',
    },
  }
  
  return JSON.stringify(translations, null, 2)
}

/**
 * Generates Thai translations JSON
 * 
 * @param meta - Plugin metadata
 * @returns Thai translations content
 */
export function generateTranslationsTH(meta: PluginMetadata): string {
  const translations = {
    title: meta.name,
    subtitle: meta.description,
    list: {
      title: `${meta.resourceNamePlural}ทั้งหมด`,
      description: `จัดการ${meta.resourceNameKebabPlural}`,
      search_placeholder: 'ค้นหา...',
      no_items: `ไม่พบ${meta.resourceNameKebabPlural}`,
    },
    form: {
      create_title: `สร้าง${meta.resourceName}`,
      edit_title: `แก้ไข${meta.resourceName}`,
      description: 'กรอกรายละเอียดด้านล่าง',
      create: `สร้าง${meta.resourceName}`,
      edit: `แก้ไข${meta.resourceName}`,
      fill_details: 'กรอกรายละเอียด',
    },
    detail: {
      subtitle: `รายละเอียด${meta.resourceName}`,
      information: 'ข้อมูล',
      description: `ดูรายละเอียด${meta.resourceNameKebab}`,
      no_description: 'ไม่มีคำอธิบาย',
    },
    fields: {
      name: 'ชื่อ',
      name_placeholder: `ใส่ชื่อ${meta.resourceNameKebab}`,
      name_description: `ชื่อของ${meta.resourceNameKebab}`,
      description: 'คำอธิบาย',
      description_placeholder: 'ใส่คำอธิบาย',
      description_description: 'คำอธิบาย (ไม่บังคับ)',
      created_at: 'สร้างเมื่อ',
      updated_at: 'อัปเดตเมื่อ',
      actions: 'การกระทำ',
    },
    actions: {
      create: 'สร้าง',
      edit: 'แก้ไข',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      delete: 'ลบ',
      back: 'กลับ',
    },
    messages: {
      created_success: `สร้าง${meta.resourceName}สำเร็จ`,
      updated_success: `อัปเดต${meta.resourceName}สำเร็จ`,
      deleted_success: `ลบ${meta.resourceName}สำเร็จ`,
      error: 'เกิดข้อผิดพลาด',
    },
  }
  
  return JSON.stringify(translations, null, 2)
}

// =============================================================================
// EVENT HANDLERS TEMPLATE
// =============================================================================

/**
 * Generates event handlers
 * 
 * @param meta - Plugin metadata
 * @returns Event handlers content
 */
export function generateEventHandlers(meta: PluginMetadata): string {
  return `/**
 * Event Handlers for ${meta.name}
 * 
 * This file contains handlers for events that this plugin listens to.
 */

/**
 * Handle user logged in event
 * 
 * @param data - Event data
 */
export default async function handleUserLoggedIn(data: any) {
  console.log('User logged in:', data)
  // Add your logic here
}
`
}

// =============================================================================
// MAIN GENERATION FUNCTION
// =============================================================================

/**
 * Generates all files based on selected features
 * 
 * This is the main orchestrator that decides which files to generate
 * based on the user's feature selections.
 * 
 * @param meta - Plugin metadata with feature flags
 * @returns Array of generated files with paths and content
 */
export function generateAllFiles(meta: PluginMetadata): GeneratedFile[] {
  const files: GeneratedFile[] = []
  
  // Base files (always generated)
  files.push({ path: 'package.json', content: generatePackageJson(meta) })
  files.push({ path: 'tsconfig.json', content: generateTsConfig(meta) })
  files.push({ path: '.npmignore', content: generateNpmIgnore(meta) })
  files.push({ path: 'README.md', content: generateReadme(meta) })
  files.push({ path: 'src/index.ts', content: generateManifest(meta) })
  
  // Frontend files
  if (meta.features.frontend) {
    files.push({ path: 'src/frontend/routes.tsx', content: generateRoutes(meta) })
    files.push({ path: `src/frontend/pages/${meta.resourceNamePlural}List.tsx`, content: generateListPage(meta) })
    files.push({ path: `src/frontend/pages/${meta.resourceName}Form.tsx`, content: generateFormPage(meta) })
    files.push({ path: `src/frontend/pages/${meta.resourceName}Detail.tsx`, content: generateDetailPage(meta) })
  }
  
  // Menu files
  if (meta.features.menu) {
    files.push({ path: 'src/frontend/menu.tsx', content: generateMenu(meta) })
  }
  
  // Backend files
  if (meta.features.backend) {
    files.push({
      path: `src/backend/functions/manage-${meta.resourceNameKebabPlural}/index.ts`,
      content: generateEdgeFunction(meta),
    })
  }
  
  // Database files
  if (meta.features.database) {
    files.push({
      path: 'src/database/migrations/001_initial.sql',
      content: generateMigration(meta),
    })
  }
  
  // Permissions files
  if (meta.features.permissions) {
    files.push({
      path: 'src/permissions/definitions.json',
      content: generatePermissions(meta),
    })
  }
  
  // Translation files
  if (meta.features.translations) {
    files.push({
      path: 'src/translations/en.json',
      content: generateTranslationsEN(meta),
    })
    files.push({
      path: 'src/translations/th.json',
      content: generateTranslationsTH(meta),
    })
  }
  
  // Event handler files
  if (meta.features.events) {
    files.push({
      path: 'src/events/handlers.ts',
      content: generateEventHandlers(meta),
    })
  }
  
  return files
}

