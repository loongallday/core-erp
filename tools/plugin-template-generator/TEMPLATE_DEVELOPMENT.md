# Template Development Guide

Complete guide to creating and customizing templates for the Core ERP Plugin Template Generator.

## Table of Contents

1. [Introduction](#introduction)
2. [Template Basics](#template-basics)
3. [Template Function Signature](#template-function-signature)
4. [Template Context](#template-context)
5. [Creating a New Template](#creating-a-new-template)
6. [Variable Interpolation](#variable-interpolation)
7. [Best Practices](#best-practices)
8. [Testing Templates](#testing-templates)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

## Introduction

Templates are TypeScript functions that generate file content based on a `TemplateContext`. They allow you to create consistent, customizable code across all generated plugins.

### Why Templates?

- **Consistency**: All plugins follow the same patterns
- **Maintainability**: Update templates to change all future plugins
- **Flexibility**: Templates can be dynamic based on context
- **Type Safety**: Full TypeScript support prevents errors

## Template Basics

### What is a Template?

A template is a function that:
1. Takes a `TemplateContext` object as input
2. Returns a string (the file content)
3. Is pure (no side effects)

### Simple Example

\`\`\`typescript
import { TemplateContext } from '../types.js'

export function simpleTemplate(ctx: TemplateContext): string {
  return \`// \${ctx.pluginName} - Generated File
export const plugin = {
  id: '\${ctx.pluginId}',
  name: '\${ctx.pluginName}',
}
\`
}
\`\`\`

## Template Function Signature

All template functions must follow this signature:

\`\`\`typescript
export type TemplateFunction = (ctx: TemplateContext) => string
\`\`\`

### Parameters

- **ctx**: `TemplateContext` - Contains all variables for interpolation

### Return Value

- **string**: The complete file content

### Example

\`\`\`typescript
/**
 * Generates a configuration file
 * 
 * @param ctx - Template context
 * @returns Configuration file content
 */
export function configTemplate(ctx: TemplateContext): string {
  return \`{
  "pluginId": "\${ctx.pluginId}",
  "enabled": true
}\`
}
\`\`\`

## Template Context

The `TemplateContext` interface provides all variables needed for string interpolation.

### Available Variables

#### Plugin Identifiers

\`\`\`typescript
ctx.pluginName          // "Inventory Management"
ctx.pluginId            // "inventory-management"
ctx.pluginIdCamel       // "inventoryManagement"
ctx.pluginIdPascal      // "InventoryManagement"
ctx.packageName         // "@core-erp/plugin-inventory-management"
\`\`\`

#### Resource Names (for CRUD examples)

\`\`\`typescript
ctx.resourceName              // "Item"
ctx.resourceNamePlural        // "Items"
ctx.resourceNameLower         // "item"
ctx.resourceNameLowerPlural   // "items"
ctx.resourceNameCamel         // "item"
ctx.resourceNamePascal        // "Item"
\`\`\`

#### Metadata

\`\`\`typescript
ctx.description        // Plugin description
ctx.author            // Author name
ctx.category          // Plugin category
ctx.year              // Current year
ctx.date              // Current date (ISO)
\`\`\`

#### Feature Flags

\`\`\`typescript
ctx.features.frontend      // boolean
ctx.features.menu          // boolean
ctx.features.widgets       // boolean
ctx.features.backend       // boolean
ctx.features.database      // boolean
ctx.features.permissions   // boolean
ctx.features.translations  // boolean
ctx.features.events        // boolean
\`\`\`

### Using Context in Templates

\`\`\`typescript
export function exampleTemplate(ctx: TemplateContext): string {
  // Access any context variable
  const name = ctx.pluginName
  const id = ctx.pluginId
  
  // Use feature flags for conditional content
  const hasDatabase = ctx.features.database
  
  // Build the template
  return \`
/**
 * \${name}
 * Author: \${ctx.author}
 */

export const config = {
  id: '\${id}',
  database: \${hasDatabase}
}
  \`.trim()
}
\`\`\`

## Creating a New Template

### Step 1: Create Template File

Create a new file in `src/templates/` directory:

\`\`\`bash
touch src/templates/my-feature.ts
\`\`\`

### Step 2: Define Template Function

\`\`\`typescript
/**
 * Core ERP Plugin Template Generator - My Feature Template
 * 
 * Brief description of what this template generates.
 */

import { TemplateContext } from '../types.js'

/**
 * Generates [description]
 * 
 * Creates [what it creates] with:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 * 
 * @param ctx - Template context
 * @returns [File name] content
 */
export function myFeatureTemplate(ctx: TemplateContext): string {
  return \`// Your template content here
// Use \${ctx.variableName} for interpolation
\`
}
\`\`\`

### Step 3: Add to File Generator

Edit `src/fileGenerator.ts` to include your template:

\`\`\`typescript
import * as myFeatureTemplates from './templates/my-feature.js'

// In generateAllFiles() or a specific generator function:
if (ctx.features.myFeature) {
  files.push({
    path: 'src/my-feature/index.ts',
    content: myFeatureTemplates.myFeatureTemplate(ctx),
  })
}
\`\`\`

### Step 4: Update Types (if needed)

If you added a new feature flag, update `src/types.ts`:

\`\`\`typescript
export interface PluginFeatures {
  // ... existing features
  myFeature: boolean  // Add your feature
}
\`\`\`

### Step 5: Update Prompts (if needed)

If your template needs user input, update `src/prompts.ts`:

\`\`\`typescript
{
  type: 'checkbox',
  name: 'features',
  message: 'Which features do you want to include?',
  choices: [
    // ... existing choices
    { name: 'My Feature', value: 'myFeature', checked: false },
  ],
}
\`\`\`

### Step 6: Test Your Template

Run the generator and verify the output:

\`\`\`bash
npm run generate-plugin
\`\`\`

## Variable Interpolation

### Basic Interpolation

Use `\${variable}` syntax inside template literals:

\`\`\`typescript
export function basicTemplate(ctx: TemplateContext): string {
  return \`
const name = '\${ctx.pluginName}'
const id = '\${ctx.pluginId}'
  \`
}
\`\`\`

### Conditional Content

Use JavaScript conditionals:

\`\`\`typescript
export function conditionalTemplate(ctx: TemplateContext): string {
  return \`
export const config = {
  name: '\${ctx.pluginName}',
  \${ctx.features.database ? \`
  database: {
    enabled: true,
    table: '\${ctx.pluginId}_\${ctx.resourceNameLowerPlural}'
  },
  \` : ''}
}
  \`.trim()
}
\`\`\`

### Loops and Arrays

Use JavaScript array methods:

\`\`\`typescript
export function loopTemplate(ctx: TemplateContext): string {
  const permissions = ['view', 'create', 'edit', 'delete']
  
  const permissionList = permissions.map(action => 
    \`'\${ctx.pluginId}:\${action}'\`
  ).join(',\\n  ')
  
  return \`
export const permissions = [
  \${permissionList}
]
  \`
}
\`\`\`

### Multi-line Strings

Use template literals for multi-line content:

\`\`\`typescript
export function multilineTemplate(ctx: TemplateContext): string {
  return \`/**
 * \${ctx.pluginName}
 * 
 * \${ctx.description}
 * 
 * @author \${ctx.author}
 * @version 1.0.0
 */

export const plugin = {
  id: '\${ctx.pluginId}',
  name: '\${ctx.pluginName}',
}
\`
}
\`\`\`

### Escaping Special Characters

Use backslash to escape template literal syntax:

\`\`\`typescript
export function escapedTemplate(ctx: TemplateContext): string {
  return \`
// This uses the context variable:
const name = '\${ctx.pluginName}'

// This is literal \${template} syntax in the output:
const template = \\\`Hello \\\${world}\\\`
  \`
}
\`\`\`

## Best Practices

### 1. Add JSDoc Comments

Always document what your template generates:

\`\`\`typescript
/**
 * Generates user profile component
 * 
 * Creates a React component with:
 * - Avatar display
 * - User information
 * - Edit button
 * 
 * @param ctx - Template context
 * @returns UserProfile.tsx content
 */
export function userProfileTemplate(ctx: TemplateContext): string {
  // ...
}
\`\`\`

### 2. Keep Templates Pure

Templates should be pure functions (no side effects):

❌ **Bad:**
\`\`\`typescript
let counter = 0

export function badTemplate(ctx: TemplateContext): string {
  counter++  // Side effect!
  return \`const value = \${counter}\`
}
\`\`\`

✅ **Good:**
\`\`\`typescript
export function goodTemplate(ctx: TemplateContext): string {
  return \`const value = '\${ctx.pluginName}'\`
}
\`\`\`

### 3. Use Consistent Indentation

Match the indentation of the generated code:

\`\`\`typescript
export function indentedTemplate(ctx: TemplateContext): string {
  return \`export const config = {
  name: '\${ctx.pluginName}',
  settings: {
    enabled: true,
    options: {
      value: 100
    }
  }
}\`
}
\`\`\`

### 4. Handle Optional Content Gracefully

Use ternary operators for optional content:

\`\`\`typescript
export function optionalTemplate(ctx: TemplateContext): string {
  return \`
export const config = {
  name: '\${ctx.pluginName}',\${ctx.features.database ? \`
  database: true,\` : ''}\${ctx.features.backend ? \`
  api: true,\` : ''}
}
  \`.trim()
}
\`\`\`

### 5. Validate Context

Check for required values:

\`\`\`typescript
export function validatedTemplate(ctx: TemplateContext): string {
  if (!ctx.pluginName) {
    throw new Error('pluginName is required')
  }
  
  return \`const name = '\${ctx.pluginName}'\`
}
\`\`\`

### 6. Use Helper Functions

Extract complex logic to helper functions:

\`\`\`typescript
function generateImports(features: PluginFeatures): string {
  const imports: string[] = []
  
  if (features.frontend) {
    imports.push("import { Route } from 'react-router-dom'")
  }
  if (features.translations) {
    imports.push("import { useTranslation } from 'react-i18next'")
  }
  
  return imports.join('\\n')
}

export function withHelpersTemplate(ctx: TemplateContext): string {
  return \`\${generateImports(ctx.features)}

export const component = {}
  \`
}
\`\`\`

## Testing Templates

### Manual Testing

1. Run the generator:
\`\`\`bash
npm run generate-plugin
\`\`\`

2. Check the generated files

3. Verify content is correct

4. Test the generated plugin works

### Automated Testing

Create a test file (future enhancement):

\`\`\`typescript
import { describe, it, expect } from 'vitest'
import { myTemplate } from './templates/my-feature.js'

describe('myTemplate', () => {
  it('generates correct content', () => {
    const ctx = createTestContext()
    const result = myTemplate(ctx)
    
    expect(result).toContain('expected content')
  })
})
\`\`\`

## Common Patterns

### Pattern 1: Conditional Imports

\`\`\`typescript
export function conditionalImportsTemplate(ctx: TemplateContext): string {
  const imports: string[] = []
  
  if (ctx.features.frontend) {
    imports.push("import { Route } from 'react-router-dom'")
  }
  if (ctx.features.backend) {
    imports.push("import { supabase } from '@supabase/supabase-js'")
  }
  
  return \`\${imports.join('\\n')}

export const plugin = {}
  \`
}
\`\`\`

### Pattern 2: Dynamic Arrays

\`\`\`typescript
export function dynamicArrayTemplate(ctx: TemplateContext): string {
  const items = [
    \`{ id: '\${ctx.pluginId}', name: '\${ctx.pluginName}' }\`,
    ctx.features.database ? \`{ type: 'database' }\` : null,
    ctx.features.backend ? \`{ type: 'backend' }\` : null,
  ].filter(Boolean).join(',\\n  ')
  
  return \`export const config = [
  \${items}
]\`
}
\`\`\`

### Pattern 3: Section Templates

\`\`\`typescript
function generateSection(title: string, content: string): string {
  return \`// ============================================================================
// \${title.toUpperCase()}
// ============================================================================

\${content}
\`
}

export function sectionsTemplate(ctx: TemplateContext): string {
  return \`
\${generateSection('Configuration', \`export const config = {}\`)}
\${generateSection('Exports', \`export default config\`)}
  \`.trim()
}
\`\`\`

## Troubleshooting

### Issue: Template Doesn't Generate

**Problem**: Your template function is defined but nothing is generated.

**Solution**: Make sure you added it to `fileGenerator.ts`:

\`\`\`typescript
// In fileGenerator.ts
import * as myTemplates from './templates/my-feature.js'

// In the appropriate generator function
files.push({
  path: 'path/to/file.ts',
  content: myTemplates.myTemplate(ctx),
})
\`\`\`

### Issue: Incorrect Variable Interpolation

**Problem**: Variables show as `undefined` or wrong values.

**Solution**: Check the variable name in `TemplateContext`:

\`\`\`typescript
// Check types.ts for correct property names
console.log(Object.keys(ctx))  // Debug available properties
\`\`\`

### Issue: Syntax Errors in Generated Code

**Problem**: Generated code has syntax errors.

**Solution**: Escape template literal syntax:

\`\`\`typescript
// Use \\\` to generate literal backticks
return \`const template = \\\`literal \\\${syntax}\\\`\`
\`\`\`

### Issue: Indentation Problems

**Problem**: Generated code has inconsistent indentation.

**Solution**: Use `.trim()` and proper spacing:

\`\`\`typescript
return \`
export const config = {
  value: 'test'
}
\`.trim()  // Removes leading/trailing newlines
\`\`\`

## Next Steps

- Review [Template Reference](./templates/README.md) for available templates
- Check [Architecture](./ARCHITECTURE.md) for system design
- See [Quick Start](./QUICK_START_TEMPLATES.md) for rapid template creation

---

**Happy Template Development! 🎨**

