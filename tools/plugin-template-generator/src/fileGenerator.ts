/**
 * Core ERP Plugin Template Generator - File Generation
 * 
 * This module handles the actual file generation from templates.
 * It imports all template functions and orchestrates which files
 * should be generated based on the selected features.
 */

import { TemplateContext, GeneratedFile } from './types.js'
import * as baseTemplates from './templates/base.js'
import * as manifestTemplates from './templates/manifest.js'
import * as frontendTemplates from './templates/frontend.js'
import * as backendTemplates from './templates/backend.js'
import * as databaseTemplates from './templates/database.js'
import * as permissionTemplates from './templates/permissions.js'
import * as translationTemplates from './templates/translations.js'
import * as eventTemplates from './templates/events.js'

/**
 * Generates all files based on the template context and selected features
 * 
 * This is the main file generation function that:
 * 1. Always generates base files (package.json, tsconfig, etc.)
 * 2. Always generates the plugin manifest
 * 3. Conditionally generates feature-specific files based on context.features
 * 
 * @param ctx - Template context with all interpolation variables
 * @returns Array of files to be written to disk
 */
export function generateAllFiles(ctx: TemplateContext): GeneratedFile[] {
  const files: GeneratedFile[] = []
  
  // Always generate base files
  files.push(...generateBaseFiles(ctx))
  
  // Always generate manifest
  files.push(...generateManifestFiles(ctx))
  
  // Conditionally generate feature files
  if (ctx.features.frontend) {
    files.push(...generateFrontendFiles(ctx))
  }
  
  if (ctx.features.menu) {
    // Menu is included in frontend files, but we track it separately
    // in case we want to generate menu-only files in the future
  }
  
  if (ctx.features.widgets) {
    files.push(...generateWidgetFiles(ctx))
  }
  
  if (ctx.features.backend) {
    files.push(...generateBackendFiles(ctx))
  }
  
  if (ctx.features.database) {
    files.push(...generateDatabaseFiles(ctx))
  }
  
  if (ctx.features.permissions) {
    files.push(...generatePermissionFiles(ctx))
  }
  
  if (ctx.features.translations) {
    files.push(...generateTranslationFiles(ctx))
  }
  
  if (ctx.features.events) {
    files.push(...generateEventFiles(ctx))
  }
  
  return files
}

/**
 * Generates base files (always included)
 * - package.json
 * - tsconfig.json
 * - README.md
 * - .npmignore
 * - .gitignore
 */
function generateBaseFiles(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: 'package.json',
      content: baseTemplates.packageJsonTemplate(ctx),
    },
    {
      path: 'tsconfig.json',
      content: baseTemplates.tsconfigTemplate(ctx),
    },
    {
      path: 'README.md',
      content: baseTemplates.readmeTemplate(ctx),
    },
    {
      path: '.npmignore',
      content: baseTemplates.npmignoreTemplate(ctx),
    },
    {
      path: '.gitignore',
      content: baseTemplates.gitignoreTemplate(ctx),
    },
  ]
}

/**
 * Generates plugin manifest (always included)
 * - src/index.ts
 */
function generateManifestFiles(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: 'src/index.ts',
      content: manifestTemplates.manifestTemplate(ctx),
    },
  ]
}

/**
 * Generates frontend files (if features.frontend)
 * - src/frontend/routes.tsx
 * - src/frontend/menu.tsx
 * - src/frontend/pages/{Resource}List.tsx
 * - src/frontend/pages/{Resource}Form.tsx
 * - src/frontend/pages/{Resource}Detail.tsx
 */
function generateFrontendFiles(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: 'src/frontend/routes.tsx',
      content: frontendTemplates.routesTemplate(ctx),
    },
    {
      path: 'src/frontend/menu.tsx',
      content: frontendTemplates.menuTemplate(ctx),
    },
    {
      path: `src/frontend/pages/${ctx.resourceNamePascal}List.tsx`,
      content: frontendTemplates.listPageTemplate(ctx),
    },
    {
      path: `src/frontend/pages/${ctx.resourceNamePascal}Form.tsx`,
      content: frontendTemplates.formPageTemplate(ctx),
    },
    {
      path: `src/frontend/pages/${ctx.resourceNamePascal}Detail.tsx`,
      content: frontendTemplates.detailPageTemplate(ctx),
    },
  ]
}

/**
 * Generates widget files (if features.widgets)
 * - src/frontend/widgets/{Plugin}Widget.tsx
 */
function generateWidgetFiles(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: `src/frontend/widgets/${ctx.pluginIdPascal}Widget.tsx`,
      content: frontendTemplates.widgetTemplate(ctx),
    },
  ]
}

/**
 * Generates backend files (if features.backend)
 * - src/backend/functions/manage-{resources}/index.ts
 */
function generateBackendFiles(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: `src/backend/functions/manage-${ctx.resourceNameLowerPlural}/index.ts`,
      content: backendTemplates.edgeFunctionTemplate(ctx),
    },
  ]
}

/**
 * Generates database files (if features.database)
 * - src/database/migrations/001_initial.sql
 * - src/database/seeds/sample_data.sql
 */
function generateDatabaseFiles(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: 'src/database/migrations/001_initial.sql',
      content: databaseTemplates.migrationTemplate(ctx),
    },
    {
      path: 'src/database/seeds/sample_data.sql',
      content: databaseTemplates.seedTemplate(ctx),
    },
  ]
}

/**
 * Generates permission files (if features.permissions)
 * - src/permissions/definitions.json
 */
function generatePermissionFiles(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: 'src/permissions/definitions.json',
      content: permissionTemplates.permissionsTemplate(ctx),
    },
  ]
}

/**
 * Generates translation files (if features.translations)
 * - src/translations/en.json
 * - src/translations/th.json
 */
function generateTranslationFiles(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: 'src/translations/en.json',
      content: translationTemplates.enTranslationsTemplate(ctx),
    },
    {
      path: 'src/translations/th.json',
      content: translationTemplates.thTranslationsTemplate(ctx),
    },
  ]
}

/**
 * Generates event handler files (if features.events)
 * - src/events/handlers.ts
 */
function generateEventFiles(ctx: TemplateContext): GeneratedFile[] {
  return [
    {
      path: 'src/events/handlers.ts',
      content: eventTemplates.handlersTemplate(ctx),
    },
  ]
}

