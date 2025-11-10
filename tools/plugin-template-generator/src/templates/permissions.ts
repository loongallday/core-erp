/**
 * Core ERP Plugin Template Generator - Permission Templates
 * 
 * This module contains templates for permission definitions.
 * Permissions follow the format: {plugin-id}:{action}
 */

import { TemplateContext } from '../types.js'

/**
 * Generates permission definitions JSON
 * 
 * Creates standard CRUD permissions:
 * - view: Read access
 * - create: Create new records
 * - edit: Modify existing records
 * - delete: Remove records
 * 
 * @param ctx - Template context
 * @returns JSON permission definitions
 */
export function permissionsTemplate(ctx: TemplateContext): string {
  const permissions = [
    {
      code: `${ctx.pluginId}:view`,
      name: `View ${ctx.resourceNamePlural}`,
      description: `Can view ${ctx.resourceNameLowerPlural} and their details`,
      category: ctx.pluginId,
    },
    {
      code: `${ctx.pluginId}:create`,
      name: `Create ${ctx.resourceNamePlural}`,
      description: `Can create new ${ctx.resourceNameLowerPlural}`,
      category: ctx.pluginId,
    },
    {
      code: `${ctx.pluginId}:edit`,
      name: `Edit ${ctx.resourceNamePlural}`,
      description: `Can modify existing ${ctx.resourceNameLowerPlural}`,
      category: ctx.pluginId,
    },
    {
      code: `${ctx.pluginId}:delete`,
      name: `Delete ${ctx.resourceNamePlural}`,
      description: `Can delete ${ctx.resourceNameLowerPlural}`,
      category: ctx.pluginId,
    },
  ]
  
  return JSON.stringify(permissions, null, 2)
}

