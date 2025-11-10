# Template Reference

Complete reference for all available templates in the Plugin Template Generator.

## Overview

Templates are organized by category in separate files. Each template is a function that takes `TemplateContext` and returns a string.

## Template Categories

### Base Templates (`base.ts`)

Always generated, regardless of feature selection.

#### `packageJsonTemplate(ctx)`
**Generates**: `package.json`
**Purpose**: NPM package configuration

**Key Features**:
- Proper package naming (@core-erp/plugin-{id})
- Peer dependencies for React
- Build scripts
- TypeScript support

**Example Output**:
```json
{
  "name": "@core-erp/plugin-inventory",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc"
  }
}
```

#### `tsconfigTemplate(ctx)`
**Generates**: `tsconfig.json`
**Purpose**: TypeScript compiler configuration

**Key Features**:
- Strict mode enabled
- React JSX support
- Declaration files
- ES2020 target

#### `readmeTemplate(ctx)`
**Generates**: `README.md`
**Purpose**: Plugin documentation

**Key Features**:
- Installation instructions
- Configuration examples
- Feature list (dynamic based on selected features)
- Usage guide
- API documentation

#### `npmignoreTemplate(ctx)`
**Generates**: `.npmignore`
**Purpose**: Files to exclude from NPM package

#### `gitignoreTemplate(ctx)`
**Generates**: `.gitignore`
**Purpose**: Files to exclude from Git

### Manifest Templates (`manifest.ts`)

Always generated - this is the plugin entry point.

#### `manifestTemplate(ctx)`
**Generates**: `src/index.ts`
**Purpose**: Plugin manifest with all capabilities

**Key Features**:
- Plugin metadata
- Zod configuration schema
- Frontend/backend/database capabilities
- Lifecycle hooks
- Health check function

**Example Excerpt**:
```typescript
export const plugin: PluginManifest = {
  id: 'inventory',
  name: 'Inventory Management',
  coreVersion: '>=1.0.0',
  frontend: {
    routes: () => import('./frontend/routes'),
    menu: () => import('./frontend/menu'),
  }
}
```

### Frontend Templates (`frontend.ts`)

Generated if `features.frontend` is true.

#### `routesTemplate(ctx)`
**Generates**: `src/frontend/routes.tsx`
**Purpose**: React Router route definitions

**Key Features**:
- Lazy-loaded components
- Permission-based routes
- CRUD routes (list, create, edit, detail)

**Example Output**:
```typescript
export default [
  {
    path: '/inventory',
    component: ItemList,
    requiredPermission: 'inventory:view',
  }
]
```

#### `menuTemplate(ctx)`
**Generates**: `src/frontend/menu.tsx`
**Purpose**: Sidebar menu configuration

**Key Features**:
- Lucide icon support
- Permission-based visibility
- Ordering and grouping

#### `listPageTemplate(ctx)`
**Generates**: `src/frontend/pages/{Resource}List.tsx`
**Purpose**: List/table view for resources

**Key Features**:
- React Query data fetching
- Search functionality
- Actions (view, edit, delete)
- Permission checks
- Loading/empty states
- Delete confirmation dialog

**Technologies Used**:
- React Query
- shadcn/ui Table
- i18next
- React Router

#### `formPageTemplate(ctx)`
**Generates**: `src/frontend/pages/{Resource}Form.tsx`
**Purpose**: Create/edit form

**Key Features**:
- React Hook Form + Zod validation
- Create and edit modes
- Field validation with error messages
- Auto-population for edit mode
- Cancel and save actions

#### `detailPageTemplate(ctx)`
**Generates**: `src/frontend/pages/{Resource}Detail.tsx`
**Purpose**: Detail/view page

**Key Features**:
- Read-only display
- Edit button (if permitted)
- Delete button (if permitted)
- Back navigation

#### `widgetTemplate(ctx)`
**Generates**: `src/frontend/widgets/{Plugin}Widget.tsx`
**Purpose**: Dashboard widget
**Condition**: `features.widgets` is true

**Key Features**:
- Summary statistics
- Quick actions
- Responsive design

### Backend Templates (`backend.ts`)

Generated if `features.backend` is true.

#### `edgeFunctionTemplate(ctx)`
**Generates**: `src/backend/functions/manage-{resources}/index.ts`
**Purpose**: Supabase Edge Function with CRUD operations

**Key Features**:
- Full CRUD (Create, Read, Update, Delete, List)
- Authentication checks
- Input validation
- Error handling
- CORS headers
- Audit logging

**Supported Actions**:
- `list`: Get all records
- `get`: Get single record
- `create`: Create new record
- `update`: Update record
- `delete`: Delete record

**Example Usage**:
```typescript
// From client
const { data } = await supabase.functions.invoke('manage-items', {
  body: { action: 'list' }
})
```

### Database Templates (`database.ts`)

Generated if `features.database` is true.

#### `migrationTemplate(ctx)`
**Generates**: `src/database/migrations/001_initial.sql`
**Purpose**: Database migration SQL

**Key Features**:
- Table creation with constraints
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers (updated_at)
- Permission inserts
- Rollback instructions

**Table Structure**:
- `id` (UUID, primary key)
- `name` (TEXT, required)
- `description` (TEXT, optional)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- `created_by` (UUID, foreign key)
- `updated_by` (UUID, foreign key)
- `is_active` (BOOLEAN)

#### `seedTemplate(ctx)`
**Generates**: `src/database/seeds/sample_data.sql`
**Purpose**: Sample data for testing

**Key Features**:
- 3-4 sample records
- Realistic data
- Includes inactive record for testing
- Verification query

### Permission Templates (`permissions.ts`)

Generated if `features.permissions` is true.

#### `permissionsTemplate(ctx)`
**Generates**: `src/permissions/definitions.json`
**Purpose**: Permission definitions

**Standard Permissions**:
- `{plugin}:view` - View records
- `{plugin}:create` - Create records
- `{plugin}:edit` - Edit records
- `{plugin}:delete` - Delete records

**Example Output**:
```json
[
  {
    "code": "inventory:view",
    "name": "View Items",
    "description": "Can view items and their details",
    "category": "inventory"
  }
]
```

### Translation Templates (`translations.ts`)

Generated if `features.translations` is true.

#### `enTranslationsTemplate(ctx)`
**Generates**: `src/translations/en.json`
**Purpose**: English translations

**Translation Keys**:
- Page titles and subtitles
- Field labels and descriptions
- Action buttons
- Success/error messages
- Empty states
- Confirmation dialogs

#### `thTranslationsTemplate(ctx)`
**Generates**: `src/translations/th.json`
**Purpose**: Thai translations

**Note**: Same structure as English translations

### Event Templates (`events.ts`)

Generated if `features.events` is true.

#### `handlersTemplate(ctx)`
**Generates**: `src/events/handlers.ts`
**Purpose**: Event handler functions

**Event Handlers**:
- `handleUserLoggedIn`: React to user login
- `handleUserLoggedOut`: React to user logout
- `handle{Resource}Created`: React to resource creation
- `handle{Resource}Updated`: React to resource update
- `handle{Resource}Deleted`: React to resource deletion

**Example Handler**:
```typescript
export async function handleItemCreated(data: any): Promise<void> {
  // React to item creation
  console.log('Item created:', data)
}
```

## Template Parameters

All templates receive `TemplateContext`:

```typescript
interface TemplateContext {
  // Plugin identifiers
  pluginName: string              // "Inventory Management"
  pluginId: string                // "inventory-management"
  pluginIdCamel: string           // "inventoryManagement"
  pluginIdPascal: string          // "InventoryManagement"
  packageName: string             // "@core-erp/plugin-inventory-management"
  
  // Resource names
  resourceName: string            // "Item"
  resourceNamePlural: string      // "Items"
  resourceNameLower: string       // "item"
  resourceNameLowerPlural: string // "items"
  resourceNameCamel: string       // "item"
  resourceNamePascal: string      // "Item"
  
  // Metadata
  description: string
  author: string
  category: PluginCategory
  year: string
  date: string
  
  // Feature flags
  features: PluginFeatures
}
```

## Using Templates

Templates are called by `fileGenerator.ts`:

```typescript
// Example: Generate frontend files
if (ctx.features.frontend) {
  files.push({
    path: 'src/frontend/routes.tsx',
    content: frontendTemplates.routesTemplate(ctx),
  })
}
```

## Customizing Templates

To customize a template:

1. Locate the template file in `src/templates/`
2. Find the template function
3. Modify the returned string
4. Test with generator

**Example**: Add a field to the form

```typescript
// In formPageTemplate(ctx)
// Add this to the form fields:
<FormField
  control={form.control}
  name="newField"
  render={({ field }) => (
    <FormItem>
      <FormLabel>New Field</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
    </FormItem>
  )}
/>
```

## Template Best Practices

1. **Document your template**: Add JSDoc comments
2. **Keep it pure**: No side effects
3. **Use consistent indentation**: Match generated code style
4. **Handle optional content**: Use conditionals properly
5. **Validate context**: Check required values
6. **Test thoroughly**: Generate and verify output

## Adding Custom Templates

See [Template Development Guide](../TEMPLATE_DEVELOPMENT.md) for detailed instructions on creating new templates.

## Example: Complete Template

```typescript
/**
 * Generates a utility helper file
 * 
 * Creates common utility functions for the plugin
 * 
 * @param ctx - Template context
 * @returns utils.ts content
 */
export function utilsTemplate(ctx: TemplateContext): string {
  return \`/**
 * \${ctx.pluginName} - Utility Functions
 * 
 * Common helper functions for \${ctx.pluginId} plugin
 */

/**
 * Format \${ctx.resourceNameLower} name
 */
export function format\${ctx.resourceNamePascal}Name(name: string): string {
  return name.trim().toUpperCase()
}

/**
 * Validate \${ctx.resourceNameLower}
 */
export function validate\${ctx.resourceNamePascal}(item: any): boolean {
  return item && item.name && item.name.length > 0
}
\`
}
```

---

**For more details, see the source code in `src/templates/`**

