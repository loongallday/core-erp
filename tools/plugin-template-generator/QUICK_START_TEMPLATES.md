# Quick Start: Creating Templates

5-minute guide to adding a new template to the Plugin Template Generator.

## The Essentials

A template is a function that:
1. Takes `TemplateContext` as input
2. Returns a string (file content)
3. Uses `\${ctx.variable}` for interpolation

## 3-Step Process

### Step 1: Create Template Function

Choose the appropriate file in `src/templates/`:
- `base.ts` - Base files (package.json, README, etc.)
- `frontend.ts` - React components
- `backend.ts` - Edge Functions
- `database.ts` - SQL migrations
- `permissions.ts` - Permission definitions
- `translations.ts` - i18n files
- `events.ts` - Event handlers

Add your template:

```typescript
export function myNewTemplate(ctx: TemplateContext): string {
  return \`// Your generated code here
export const config = {
  id: '\${ctx.pluginId}',
  name: '\${ctx.pluginName}'
}\`
}
```

### Step 2: Register in File Generator

Edit `src/fileGenerator.ts`:

```typescript
// Add to the appropriate generator function
function generateMyFiles(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: 'path/to/your/file.ts',
      content: myTemplates.myNewTemplate(ctx),
    },
  ]
}

// And call it in generateAllFiles()
if (ctx.features.myFeature) {
  files.push(...generateMyFiles(ctx))
}
```

### Step 3: Test It

```bash
cd tools/plugin-template-generator
npm run build
cd ../..
npm run generate-plugin
```

## Common Templates

### Template 1: Configuration File

```typescript
export function configTemplate(ctx: TemplateContext): string {
  return \`{
  "pluginId": "\${ctx.pluginId}",
  "pluginName": "\${ctx.pluginName}",
  "version": "1.0.0"
}\`
}
```

### Template 2: React Component

```typescript
export function componentTemplate(ctx: TemplateContext): string {
  return \`import React from 'react'

export function \${ctx.resourceNamePascal}Component() {
  return (
    <div>
      <h1>\${ctx.pluginName}</h1>
      <p>\${ctx.description}</p>
    </div>
  )
}\`
}
```

### Template 3: TypeScript Interface

```typescript
export function interfaceTemplate(ctx: TemplateContext): string {
  return \`export interface \${ctx.resourceNamePascal} {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}\`
}
```

### Template 4: SQL Migration

```typescript
export function migrationTemplate(ctx: TemplateContext): string {
  return \`-- \${ctx.pluginName} Migration

CREATE TABLE IF NOT EXISTS \${ctx.pluginId}_\${ctx.resourceNameLowerPlural} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);\`
}
```

### Template 5: Conditional Content

```typescript
export function conditionalTemplate(ctx: TemplateContext): string {
  return \`export const config = {
  name: '\${ctx.pluginName}',\${ctx.features.database ? \`
  database: {
    enabled: true
  },\` : ''}\${ctx.features.backend ? \`
  api: {
    enabled: true
  },\` : ''}
}\`
}
```

## Context Variables Cheat Sheet

```typescript
// Plugin names
ctx.pluginName          // "Inventory Management"
ctx.pluginId            // "inventory-management"
ctx.pluginIdCamel       // "inventoryManagement"
ctx.pluginIdPascal      // "InventoryManagement"

// Resource names
ctx.resourceName              // "Item"
ctx.resourceNamePlural        // "Items"
ctx.resourceNameLower         // "item"
ctx.resourceNameLowerPlural   // "items"

// Metadata
ctx.description        // Plugin description
ctx.author            // Author name
ctx.year              // "2025"
ctx.date              // ISO date

// Features (boolean flags)
ctx.features.frontend
ctx.features.backend
ctx.features.database
ctx.features.permissions
ctx.features.translations
ctx.features.events
```

## Template Checklist

Before submitting your template:

- [ ] Function is exported
- [ ] Takes `TemplateContext` parameter
- [ ] Returns string
- [ ] Uses correct context variables
- [ ] Indentation is correct
- [ ] Escapes template literals if needed (\\\`)
- [ ] Added to file generator
- [ ] Tested with actual generation
- [ ] Generated code is valid
- [ ] Follows Core ERP patterns

## Common Patterns

### Loop Over Array

```typescript
const items = ['view', 'create', 'edit', 'delete']
const code = items.map(item => \`'\${ctx.pluginId}:\${item}'\`).join(',\\n')

return \`export const permissions = [
  \${code}
]\`
```

### Helper Function

```typescript
function generateImports(features: PluginFeatures): string {
  const imports: string[] = []
  if (features.frontend) imports.push("import { Route } from 'react-router-dom'")
  return imports.join('\\n')
}

export function myTemplate(ctx: TemplateContext): string {
  return \`\${generateImports(ctx.features)}

export const component = {}\`
}
```

### Multi-line Documentation

```typescript
return \`/**
 * \${ctx.pluginName}
 * 
 * \${ctx.description}
 * 
 * @author \${ctx.author}
 * @version 1.0.0
 */\`
```

## Troubleshooting

### Issue: Template not generating

**Solution**: Check that you added it to `fileGenerator.ts`

### Issue: Variables showing as undefined

**Solution**: Check variable names in `types.ts` → `TemplateContext`

### Issue: Generated code has syntax errors

**Solution**: Escape template literals with `\\\``

### Issue: Wrong indentation

**Solution**: Match indentation level in template

## Next Steps

- Read [Template Development Guide](./TEMPLATE_DEVELOPMENT.md) for details
- Review [Architecture](./ARCHITECTURE.md) for system design
- Check [Template Reference](./templates/README.md) for examples
- See [AI Context](./AI_CONTEXT.md) for AI assistance

---

**Now go create amazing templates! 🎨**

