/**
 * Core ERP Plugin Template Generator - Base File Templates
 * 
 * This module contains template functions for base files that are
 * always generated for every plugin, regardless of selected features.
 * 
 * Templates in this file:
 * - package.json - NPM package configuration
 * - tsconfig.json - TypeScript configuration
 * - README.md - Plugin documentation
 * - .npmignore - Files to exclude from NPM package
 * - .gitignore - Files to exclude from Git
 */

import { TemplateContext } from '../types.js'

/**
 * Generates package.json for the plugin
 * 
 * Creates a complete NPM package.json with:
 * - Proper package naming (@core-erp/plugin-{id})
 * - Peer dependencies for React and Core ERP
 * - Build scripts for TypeScript compilation
 * - Proper exports and module configuration
 * 
 * @param ctx - Template context
 * @returns package.json content
 */
export function packageJsonTemplate(ctx: TemplateContext): string {
  return `{
  "name": "${ctx.packageName}",
  "version": "1.0.0",
  "description": "${ctx.description}",
  "author": "${ctx.author}",
  "license": "PROPRIETARY",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src",
    "test": "vitest"
  },
  "keywords": [
    "core-erp",
    "plugin",
    "${ctx.category}",
    "${ctx.pluginId}"
  ],
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "react-i18next": "^16.2.4",
    "zod": "^3.25.0",
    "@supabase/supabase-js": "^2.79.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^22.16.5",
    "typescript": "^5.8.0",
    "eslint": "^9.32.0"
  }
}
`
}

/**
 * Generates tsconfig.json for the plugin
 * 
 * Creates TypeScript configuration optimized for:
 * - ES2020+ features
 * - React JSX
 * - Strict type checking
 * - Declaration file generation
 * 
 * @param ctx - Template context
 * @returns tsconfig.json content
 */
export function tsconfigTemplate(_ctx: TemplateContext): string {
  return `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
`
}

/**
 * Generates README.md for the plugin
 * 
 * Creates comprehensive documentation including:
 * - Plugin overview and features
 * - Installation instructions
 * - Configuration examples
 * - Usage guide
 * - Development instructions
 * 
 * @param ctx - Template context
 * @returns README.md content
 */
export function readmeTemplate(ctx: TemplateContext): string {
  const featureList = []
  if (ctx.features.frontend) featureList.push('- 📄 Frontend pages and routes')
  if (ctx.features.menu) featureList.push('- 🧭 Sidebar menu integration')
  if (ctx.features.widgets) featureList.push('- 📊 Dashboard widgets')
  if (ctx.features.backend) featureList.push('- ⚡ Edge Functions (serverless API)')
  if (ctx.features.database) featureList.push('- 🗄️ Database migrations')
  if (ctx.features.permissions) featureList.push('- 🔐 Permission system')
  if (ctx.features.translations) featureList.push('- 🌍 Multi-language support (en, th)')
  if (ctx.features.events) featureList.push('- 📡 Event handling')
  
  return `# ${ctx.pluginName}

${ctx.description}

## Overview

This plugin provides ${ctx.resourceNameLower} management capabilities for Core ERP, including full CRUD operations${ctx.features.frontend ? ', user interface' : ''}${ctx.features.backend ? ', and API endpoints' : ''}.

## Features

${featureList.join('\n')}

## Installation

### 1. Install the Plugin

\`\`\`bash
cd core-erp
npm install ${ctx.packageName}
\`\`\`

Or for local development:

\`\`\`bash
npm install file:../plugin-${ctx.pluginId}
\`\`\`

### 2. Configure in Core ERP

Add the plugin configuration to \`plugins.config.ts\`:

\`\`\`typescript
export default {
  plugins: [
    {
      package: '${ctx.packageName}',
      enabled: true,
      config: {
        // Plugin-specific configuration
      },${ctx.features.permissions ? `
      permissions: {
        '${ctx.pluginId}:view': ['user', 'manager', 'admin'],
        '${ctx.pluginId}:create': ['manager', 'admin'],
        '${ctx.pluginId}:edit': ['manager', 'admin'],
        '${ctx.pluginId}:delete': ['admin'],
      },` : ''}${ctx.features.menu ? `
      ui: {
        sidebar: {
          position: 100,
          icon: 'Package',
          label: '${ctx.pluginName}',
        },
      },` : ''}
    },
  ],
}
\`\`\`

${ctx.features.database ? `### 3. Run Database Migrations

The plugin includes database migrations that need to be applied:

1. Copy the migration file to Core ERP's Supabase migrations folder:
   \`\`\`bash
   cp src/database/migrations/001_initial.sql <core-erp>/supabase/migrations/
   \`\`\`

2. Apply migrations via Supabase dashboard or CLI

` : ''}### ${ctx.features.database ? '4' : '3'}. Restart Core ERP

\`\`\`bash
npm run dev
\`\`\`

The plugin should now be active and integrated into Core ERP.

## Usage

${ctx.features.frontend ? `### Frontend

Access the ${ctx.resourceNameLower} management interface at:

- List: \`/\${ctx.pluginId}\`
- Create: \`/\${ctx.pluginId}/new\`
- Edit: \`/\${ctx.pluginId}/:id\`

The UI includes:
- Table view with search and filtering
- Form with validation
- Detail view
` : ''}${ctx.features.backend ? `
### API Endpoints

The plugin provides Edge Functions for ${ctx.resourceNameLower} management:

\`\`\`typescript
// Create ${ctx.resourceNameLower}
const { data } = await supabase.functions.invoke('manage-${ctx.resourceNameLowerPlural}', {
  body: { action: 'create', data: { name: 'New ${ctx.resourceName}' } }
})

// List ${ctx.resourceNameLowerPlural}
const { data } = await supabase.functions.invoke('manage-${ctx.resourceNameLowerPlural}', {
  body: { action: 'list' }
})

// Update ${ctx.resourceNameLower}
const { data } = await supabase.functions.invoke('manage-${ctx.resourceNameLowerPlural}', {
  body: { action: 'update', id: '...', data: { name: 'Updated' } }
})

// Delete ${ctx.resourceNameLower}
const { data } = await supabase.functions.invoke('manage-${ctx.resourceNameLowerPlural}', {
  body: { action: 'delete', id: '...' } }
})
\`\`\`
` : ''}${ctx.features.permissions ? `
### Permissions

The plugin defines these permissions:

- \`${ctx.pluginId}:view\` - View ${ctx.resourceNameLowerPlural}
- \`${ctx.pluginId}:create\` - Create ${ctx.resourceNameLowerPlural}
- \`${ctx.pluginId}:edit\` - Edit ${ctx.resourceNameLowerPlural}
- \`${ctx.pluginId}:delete\` - Delete ${ctx.resourceNameLowerPlural}

Map these to roles in \`plugins.config.ts\`.
` : ''}
## Development

### Building

\`\`\`bash
npm run build
\`\`\`

### Watch Mode

\`\`\`bash
npm run dev
\`\`\`

### Testing

\`\`\`bash
npm test
\`\`\`

## File Structure

\`\`\`
${ctx.packageName}/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts                    # Plugin manifest${ctx.features.frontend ? `
│   ├── frontend/
│   │   ├── routes.tsx              # Route definitions
│   │   ├── menu.tsx                # Menu items
│   │   └── pages/                  # Page components` : ''}${ctx.features.backend ? `
│   ├── backend/
│   │   └── functions/              # Edge Functions` : ''}${ctx.features.database ? `
│   ├── database/
│   │   ├── migrations/             # SQL migrations
│   │   └── seeds/                  # Seed data` : ''}${ctx.features.permissions ? `
│   ├── permissions/
│   │   └── definitions.json        # Permission definitions` : ''}${ctx.features.translations ? `
│   └── translations/
│       ├── en.json                 # English translations
│       └── th.json                 # Thai translations` : ''}
└── dist/                           # Compiled output
\`\`\`

## Support

For issues and questions:
- Check Core ERP documentation
- Review plugin development guide
- Contact: ${ctx.author}

## License

${ctx.year} ${ctx.author}. All rights reserved.

This plugin is proprietary software for use with Core ERP.
`
}

/**
 * Generates .npmignore for the plugin
 * 
 * Excludes source files and development artifacts from the NPM package,
 * keeping only the compiled dist/ folder and documentation.
 * 
 * @param ctx - Template context
 * @returns .npmignore content
 */
export function npmignoreTemplate(_ctx: TemplateContext): string {
  return `# Source files (we only publish dist/)
src/
*.ts
!*.d.ts

# Development files
node_modules/
.git/
.gitignore

# Build artifacts
tsconfig.json
tsconfig.*.json

# Tests
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
__tests__/
__mocks__/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# Misc
.env
.env.*
*.local
`
}

/**
 * Generates .gitignore for the plugin
 * 
 * Excludes build artifacts, dependencies, and environment files
 * from version control.
 * 
 * @param _ctx - Template context
 * @returns .gitignore content
 */
export function gitignoreTemplate(_ctx: TemplateContext): string {
  return `# Dependencies
node_modules/

# Build output
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Misc
*.tmp
*.temp
.cache/
`
}

