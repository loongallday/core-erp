# Plugin System Quick Reference

Quick reference guide for Core ERP plugin development.

## Package Structure

```
@composable-erp/plugin-{name}/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Plugin manifest (REQUIRED)
│   ├── frontend/
│   │   ├── routes.tsx        # Routes
│   │   ├── menu.tsx          # Menu items
│   │   ├── pages/            # Page components
│   │   └── components/       # Reusable components
│   ├── backend/
│   │   └── functions/        # Edge Functions
│   ├── database/
│   │   └── migrations/       # SQL migrations
│   ├── permissions/
│   │   └── definitions.json  # Permissions
│   └── translations/         # i18n files
│       ├── en.json
│       └── th.json
└── README.md
```

## Essential Code Snippets

### Plugin Manifest

```typescript
import { PluginManifest } from '@composable-erp/plugin-types'
import { z } from 'zod'

export const configSchema = z.object({
  setting1: z.string().default('value'),
  setting2: z.boolean().default(false),
})

export const plugin: PluginManifest = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  description: 'Plugin description',
  author: 'Your Name',
  category: 'operations',
  coreVersion: '>=1.0.0',
  
  config: {
    schema: configSchema,
    defaults: { setting1: 'value', setting2: false },
  },
  
  translations: {
    namespaces: ['my-plugin'],
    defaults: {
      en: { 'my-plugin': () => import('./translations/en.json') },
      th: { 'my-plugin': () => import('./translations/th.json') },
    },
  },
  
  frontend: {
    routes: () => import('./frontend/routes'),
    menu: () => import('./frontend/menu'),
  },
  
  permissions: () => import('./permissions/definitions.json'),
  
  lifecycle: {
    onEnable: async (context) => {
      context.logger.info('Plugin enabled')
    },
  },
}
```

### Routes

```typescript
import { lazy } from 'react'
import { PluginRoute } from '@composable-erp/plugin-types'

const ListPage = lazy(() => import('./pages/ListPage'))
const FormPage = lazy(() => import('./pages/FormPage'))

export default [
  {
    path: '/my-plugin',
    component: ListPage,
    requiredPermission: 'my-plugin:view',
  },
  {
    path: '/my-plugin/new',
    component: FormPage,
    requiredPermission: 'my-plugin:create',
  },
] as PluginRoute[]
```

### Menu Items

```typescript
import { PluginMenuItem } from '@composable-erp/plugin-types'

export default [
  {
    id: 'my-plugin',
    path: '/my-plugin',
    label: 'My Plugin',
    icon: 'Layers',  // Lucide icon name
    permission: 'my-plugin:view',
    order: 100,
  },
] as PluginMenuItem[]
```

### Page Component

```typescript
import { useTranslation } from 'react-i18next'
import { usePluginConfig } from '@composable-erp/plugin-system'

export default function MyPage() {
  const { t } = useTranslation('my-plugin')
  const config = usePluginConfig('my-plugin')

  return (
    <div className="p-6">
      <h1>{t('title')}</h1>
      <p>{config?.setting1}</p>
    </div>
  )
}
```

### Permissions

```json
[
  {
    "code": "my-plugin:view",
    "name": "View My Plugin",
    "description": "Can view my plugin data",
    "category": "my-plugin"
  },
  {
    "code": "my-plugin:create",
    "name": "Create Items",
    "description": "Can create new items",
    "category": "my-plugin"
  }
]
```

### Translations

```json
{
  "title": "My Plugin",
  "subtitle": "Manage your data",
  "actions": {
    "create": "Create",
    "edit": "Edit",
    "delete": "Delete"
  },
  "fields": {
    "name": "Name",
    "description": "Description"
  }
}
```

## Configuration in Core

```typescript
// plugins.config.ts
export default {
  plugins: [
    {
      package: '@composable-erp/plugin-my-plugin',
      enabled: true,
      
      config: {
        setting1: 'custom-value',
        setting2: true,
      },
      
      localization: {
        en: { 'my-plugin.title': 'Custom Title' },
        th: { 'my-plugin.title': 'หัวข้อที่กำหนดเอง' },
      },
      
      permissions: {
        'my-plugin:view': ['user', 'admin'],
        'my-plugin:create': ['admin'],
      },
      
      ui: {
        sidebar: {
          position: 100,
          icon: 'Layers',
          label: 'My Feature',
        },
      },
    },
  ],
}
```

## Common Hooks

### usePluginConfig

```typescript
import { usePluginConfig } from '@composable-erp/plugin-system'

const config = usePluginConfig<MyConfig>('my-plugin')
```

### usePluginFeature

```typescript
import { usePluginFeature } from '@composable-erp/plugin-system'

const hasFeature = usePluginFeature('my-plugin', 'feature-name')
```

### useTranslation

```typescript
import { useTranslation } from 'react-i18next'

const { t } = useTranslation('my-plugin')
const text = t('key.path')
```

## Edge Function Template

```typescript
// backend/functions/my-function/index.ts
import { createClient } from '@supabase/supabase-js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Your logic here
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

## Migration Template

```sql
-- database/migrations/001_initial.sql

-- Create plugin table
CREATE TABLE IF NOT EXISTS my_plugin_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE my_plugin_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Items viewable by authenticated users"
  ON my_plugin_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Items manageable by users with permission"
  ON my_plugin_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
      AND p.code IN ('my-plugin:create', 'my-plugin:edit', 'my-plugin:delete')
    )
  );

-- Indexes
CREATE INDEX idx_my_plugin_items_name ON my_plugin_items(name);
```

## Build Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Lint
npm run lint

# Test
npm run test
```

## NPM Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src",
    "test": "vitest",
    "prepublishOnly": "npm run build"
  }
}
```

## TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node"
  }
}
```

## Common Issues

### Plugin not loading
- Check `plugins.config.ts` has correct package name
- Verify `enabled: true`
- Check console for errors
- Ensure plugin is installed: `npm list @composable-erp/plugin-name`

### Routes not showing
- Verify route path doesn't conflict
- Check permission is granted to user
- Ensure routes are exported correctly
- Check browser console for lazy load errors

### Translations not working
- Verify namespace matches plugin ID
- Check translation files are in correct location
- Ensure i18next is configured
- Check browser console for missing keys

### Permissions not working
- Verify permission codes follow format: `plugin-id:action`
- Check permissions are mapped in `plugins.config.ts`
- Ensure user has assigned role
- Check RLS policies in database

## Resources

- [Full Documentation](./README.md)
- [Development Guide](./PLUGIN_DEVELOPMENT_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Examples](./examples/)

