# AI Context for Plugin Template Generator

This document provides AI-friendly context and guidance for working with the Core ERP Plugin Template Generator. Use this as reference when asking AI assistants to help extend or modify the generator.

## Quick Overview

**What is this?**: CLI tool that generates complete plugin packages for Core ERP
**Language**: TypeScript (Node.js)
**Purpose**: Create consistent, production-ready plugins with working CRUD examples
**Architecture**: Pipeline: Prompts → Config → Context → Templates → Files

## Project Structure

```
tools/plugin-template-generator/
├── src/
│   ├── index.ts           # Entry point, orchestrates flow
│   ├── prompts.ts         # Inquirer prompts for user input
│   ├── generator.ts       # Core generation logic
│   ├── fileGenerator.ts   # Selects and calls templates
│   ├── utils.ts           # Helper functions
│   ├── types.ts           # TypeScript interfaces
│   └── templates/         # Template functions
│       ├── base.ts        # package.json, tsconfig, README
│       ├── manifest.ts    # Plugin manifest (index.ts)
│       ├── frontend.ts    # React components
│       ├── backend.ts     # Edge Functions
│       ├── database.ts    # SQL migrations
│       ├── permissions.ts # Permission definitions
│       ├── translations.ts# i18n files
│       └── events.ts      # Event handlers
└── [docs]                 # Documentation files
\`\`\`

## Key Concepts

### 1. Template Functions

Templates are TypeScript functions that generate file content:

```typescript
export function myTemplate(ctx: TemplateContext): string {
  return \`// Generated file
export const config = {
  id: '\${ctx.pluginId}',
  name: '\${ctx.pluginName}'
}\`
}
```

**Key Points**:
- Input: `TemplateContext` object
- Output: String (file content)
- Pure functions (no side effects)
- Use template literals for multi-line content
- Use `\${ctx.variable}` for interpolation

### 2. Template Context

All templates receive a `TemplateContext` object with variables:

```typescript
interface TemplateContext {
  // Plugin identifiers
  pluginName: "Inventory Management"
  pluginId: "inventory-management"
  pluginIdCamel: "inventoryManagement"
  pluginIdPascal: "InventoryManagement"
  packageName: "@core-erp/plugin-inventory-management"
  
  // Resource names (for CRUD)
  resourceName: "Item"
  resourceNamePlural: "Items"
  resourceNameLower: "item"
  resourceNameLowerPlural: "items"
  resourceNameCamel: "item"
  resourceNamePascal: "Item"
  
  // Metadata
  description: string
  author: string
  category: PluginCategory
  year: string
  date: string
  
  // Feature flags
  features: {
    frontend: boolean
    menu: boolean
    widgets: boolean
    backend: boolean
    database: boolean
    permissions: boolean
    translations: boolean
    events: boolean
  }
}
```

### 3. Generation Flow

```
1. User runs: npm run generate-plugin
2. CLI shows prompts (prompts.ts)
3. User answers questions
4. Config object created
5. Generator creates context (generator.ts)
6. FileGenerator calls templates (fileGenerator.ts)
7. Templates return file contents
8. Generator writes files to disk
9. Success message shown
```

## Common Tasks for AI

### Task 1: Add a New Template

**Prompt Example**:
```
"Add a new template to generate a React hook for data fetching. 
The hook should use React Query and be placed in 
src/frontend/hooks/use{ResourceNamePascal}s.ts"
```

**Steps**:
1. Add template function to `src/templates/frontend.ts`:
```typescript
export function dataHookTemplate(ctx: TemplateContext): string {
  return \`import { useQuery } from '@tanstack/react-query'
import { supabase } from '@core-erp/lib/supabase'

export function use\${ctx.resourceNamePascal}s() {
  return useQuery({
    queryKey: ['\${ctx.pluginId}', '\${ctx.resourceNameLowerPlural}'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('\${ctx.pluginId}_\${ctx.resourceNameLowerPlural}')
        .select('*')
      
      if (error) throw error
      return data
    }
  })
}\`
}

// Note: UI components come from @core-erp/ui package
// Example: import { Button, Card } from '@core-erp/ui/components/ui'
```

2. Add to file generator in `src/fileGenerator.ts`:
```typescript
function generateFrontendFiles(ctx: TemplateContext): GeneratedFile[] {
  const files = [
    // ... existing files
    {
      path: \`src/frontend/hooks/use\${ctx.resourceNamePascal}s.ts\`,
      content: frontendTemplates.dataHookTemplate(ctx),
    },
  ]
  return files
}
```

### Task 2: Modify Existing Template

**Prompt Example**:
```
"Update the list page template to add export to CSV functionality"
```

**Steps**:
1. Locate template in `src/templates/frontend.ts`
2. Find `listPageTemplate` function
3. Add the new feature to the returned template string
4. Use conditional logic if needed: `\${ctx.features.someFeature ? 'code' : ''}`

### Task 3: Add New Feature Flag

**Prompt Example**:
```
"Add a 'testing' feature flag that generates test files"
```

**Steps**:
1. Update `src/types.ts`:
```typescript
export interface PluginFeatures {
  // ... existing features
  testing: boolean
}
```

2. Update `src/prompts.ts`:
```typescript
{
  type: 'checkbox',
  name: 'features',
  choices: [
    // ... existing choices
    { name: 'Unit Tests', value: 'testing', checked: false },
  ],
}
```

3. Create template in `src/templates/testing.ts`:
```typescript
export function testTemplate(ctx: TemplateContext): string {
  return \`// Test file content\`
}
```

4. Add to `src/fileGenerator.ts`:
```typescript
if (ctx.features.testing) {
  files.push(...generateTestFiles(ctx))
}
```

### Task 4: Add New Prompt Question

**Prompt Example**:
```
"Add a prompt asking for the plugin license type"
```

**Steps**:
1. Update `src/types.ts`:
```typescript
export interface PluginConfig {
  // ... existing fields
  license: string
}
```

2. Add prompt in `src/prompts.ts`:
```typescript
const licenseAnswer = await inquirer.prompt([
  {
    type: 'list',
    name: 'license',
    message: 'License type:',
    choices: ['MIT', 'ISC', 'PROPRIETARY'],
    default: 'PROPRIETARY',
  },
])
```

3. Add to config object:
```typescript
const config: PluginConfig = {
  // ... existing fields
  license: licenseAnswer.license,
}
```

4. Update `src/generator.ts` to pass to context:
```typescript
return {
  // ... existing fields
  license: config.license,
}
```

5. Use in templates:
```typescript
\${ctx.license}
```

### Task 5: Update Generated Code Pattern

**Prompt Example**:
```
"Change all list pages to use server-side pagination instead of client-side"
```

**Steps**:
1. Locate `listPageTemplate` in `src/templates/frontend.ts`
2. Modify the template to include pagination state:
```typescript
const [page, setPage] = useState(1)
const [pageSize, setPageSize] = useState(10)
```
3. Update the query to use pagination parameters
4. Add pagination controls to the UI

## Helper Functions Available

### String Transformations (utils.ts)

```typescript
toKebabCase("Inventory Management") // "inventory-management"
toCamelCase("inventory-management")  // "inventoryManagement"
toPascalCase("inventory-management") // "InventoryManagement"
toPlural("item")                     // "items"
```

### Validation (utils.ts)

```typescript
validatePluginName(name)     // { valid: boolean, error?: string }
validateResourceName(name)   // { valid: boolean, error?: string }
validateOutputDir(path)      // { valid: boolean, error?: string }
```

### Other Utilities (utils.ts)

```typescript
getCurrentYear()              // "2025"
getCurrentDate()              // ISO date string
createPackageName(id)         // "@core-erp/plugin-{id}"
```

## Important Patterns

### Pattern 1: Conditional Content in Templates

```typescript
export function conditionalTemplate(ctx: TemplateContext): string {
  return \`
export const config = {
  name: '\${ctx.pluginName}',\${ctx.features.database ? \`
  database: true,\` : ''}\${ctx.features.backend ? \`
  api: true,\` : ''}
}
  \`.trim()
}
```

### Pattern 2: Loops in Templates

```typescript
export function loopTemplate(ctx: TemplateContext): string {
  const items = ['view', 'create', 'edit', 'delete']
  const permissions = items.map(action => 
    \`'\${ctx.pluginId}:\${action}'\`
  ).join(',\\n  ')
  
  return \`export const permissions = [
  \${permissions}
]\`
}
```

### Pattern 3: Helper Functions in Templates

```typescript
function generateImports(features: PluginFeatures): string {
  const imports: string[] = []
  if (features.frontend) imports.push("import { Route } from 'react-router-dom'")
  if (features.backend) imports.push("import { supabase } from '...'")
  return imports.join('\\n')
}

export function templateWithHelper(ctx: TemplateContext): string {
  return \`\${generateImports(ctx.features)}

export const component = {}\`
}
```

### Pattern 4: Multi-line Strings

```typescript
export function multilineTemplate(ctx: TemplateContext): string {
  return \`/**
 * \${ctx.pluginName}
 * 
 * \${ctx.description}
 */

export const plugin = {
  id: '\${ctx.pluginId}'
}\`
}
```

## Testing Your Changes

After making changes:

1. Build the generator:
```bash
cd tools/plugin-template-generator
npm run build
```

2. Run from Core ERP root:
```bash
npm run generate-plugin
```

3. Answer prompts and check generated output

4. Verify generated plugin:
```bash
cd <generated-plugin>
npm install
npm run build
# Check for errors
```

## Common Pitfalls

### Pitfall 1: Forgetting to Export Template

❌ **Bad**:
```typescript
function myTemplate(ctx: TemplateContext): string {
  return \`...\`
}
```

✅ **Good**:
```typescript
export function myTemplate(ctx: TemplateContext): string {
  return \`...\`
}
```

### Pitfall 2: Not Escaping Template Literals

❌ **Bad** (will try to interpolate at generation time):
```typescript
return \`const template = \`Hello \${world}\`\`
```

✅ **Good** (will output literal template syntax):
```typescript
return \`const template = \\\`Hello \\\${world}\\\`\`
```

### Pitfall 3: Inconsistent Indentation

❌ **Bad**:
```typescript
return \`export const config = {
name: 'test'
}\`
```

✅ **Good**:
```typescript
return \`export const config = {
  name: 'test'
}\`
```

### Pitfall 4: Forgetting to Update File Generator

❌ **Bad**: Create template but don't add to fileGenerator.ts

✅ **Good**: After creating template, add it to the appropriate generator function

## Files to Modify by Task Type

| Task | Files to Modify |
|------|----------------|
| Add new template | `templates/{category}.ts`, `fileGenerator.ts` |
| Add feature flag | `types.ts`, `prompts.ts`, `templates/*.ts`, `fileGenerator.ts` |
| Add prompt question | `types.ts`, `prompts.ts`, `generator.ts` |
| Modify existing template | `templates/{category}.ts` |
| Add helper function | `utils.ts` |
| Change generation logic | `generator.ts` |

## Prompt Templates for Common Tasks

### Add a Component Template

```
"Create a template that generates a [component type] component in 
src/frontend/components/[name].tsx. The component should [description]. 
Use the following context variables: [list variables]. Add it to the 
frontend file generator."
```

### Modify Existing Template

```
"Update the [template name] template in src/templates/[file].ts to 
[description of change]. Make sure to [specific requirements]."
```

### Add Conditional Feature

```
"Add a new feature flag called '[feature]' that when enabled, generates 
[what it generates]. Add the prompt option, update types, create the 
template, and integrate it into the file generator."
```

## Quick Reference

### Template Function Signature
```typescript
(ctx: TemplateContext) => string
```

### Add File to Generation
```typescript
files.push({
  path: 'relative/path/to/file.ext',
  content: templateFunction(ctx),
})
```

### Access Feature Flags
```typescript
ctx.features.frontend  // boolean
ctx.features.backend   // boolean
// etc.
```

### Common Context Variables
```typescript
ctx.pluginName         // Display name
ctx.pluginId           // kebab-case ID
ctx.resourceName       // CRUD resource
ctx.description        // Plugin description
ctx.author             // Author name
```

---

**Use this document as reference when working with AI assistants to extend or modify the Plugin Template Generator.**

