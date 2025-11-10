/**
 * Core ERP Plugin Template Generator - Event Handler Templates
 * 
 * This module contains templates for event handlers.
 * Events enable inter-plugin communication and integration with Core ERP.
 */

import { TemplateContext } from '../types.js'

/**
 * Generates event handler module (src/events/handlers.ts)
 * 
 * Creates event handlers for:
 * - Listening to core system events
 * - Reacting to other plugin events
 * - Processing async event-driven workflows
 * 
 * @param ctx - Template context
 * @returns Event handlers TypeScript content
 */
export function handlersTemplate(ctx: TemplateContext): string {
  return `/**
 * ${ctx.pluginName} - Event Handlers
 * 
 * Handles events from the Core ERP system and other plugins.
 * Events enable loose coupling and async communication between components.
 */

/**
 * Handle core:user-logged-in event
 * 
 * This event is emitted by Core ERP when a user successfully logs in.
 * You can use this to initialize plugin-specific data, refresh caches, etc.
 * 
 * @param data - Event data containing user information
 */
export async function handleUserLoggedIn(data: any): Promise<void> {
  console.log('${ctx.pluginName}: User logged in', data.user?.email)
  
  // Example: Initialize user-specific data
  // await initializeUserData(data.user.id)
  
  // Example: Log the event
  // await logUserActivity(data.user.id, 'logged_in')
}

/**
 * Handle core:user-logged-out event
 * 
 * This event is emitted when a user logs out.
 * Use this to cleanup, save state, or perform other logout-related tasks.
 * 
 * @param data - Event data
 */
export async function handleUserLoggedOut(data: any): Promise<void> {
  console.log('${ctx.pluginName}: User logged out')
  
  // Example: Cleanup cached data
  // clearUserCache()
  
  // Example: Save any pending state
  // await savePluginState()
}

/**
 * Handle ${ctx.pluginId}:${ctx.resourceNameLower}-created event
 * 
 * This is a custom event that your plugin can emit.
 * Other plugins can listen to this event to react to ${ctx.resourceNameLower} creation.
 * 
 * @param data - Event data containing the created ${ctx.resourceNameLower}
 */
export async function handle${ctx.resourceNamePascal}Created(data: any): Promise<void> {
  console.log('${ctx.pluginName}: ${ctx.resourceName} created', data)
  
  // Example: Send notification
  // await sendNotification({
  //   title: '${ctx.resourceName} Created',
  //   message: \`New ${ctx.resourceNameLower} "\${data.name}" was created\`,
  // })
  
  // Example: Trigger related workflows
  // await triggerWorkflow('${ctx.resourceNameLower}-created', data)
}

/**
 * Handle ${ctx.pluginId}:${ctx.resourceNameLower}-updated event
 * 
 * Emitted when a ${ctx.resourceNameLower} is updated.
 * 
 * @param data - Event data containing the updated ${ctx.resourceNameLower}
 */
export async function handle${ctx.resourceNamePascal}Updated(data: any): Promise<void> {
  console.log('${ctx.pluginName}: ${ctx.resourceName} updated', data)
  
  // Example: Invalidate caches
  // invalidateCache(\`${ctx.resourceNameLower}-\${data.id}\`)
  
  // Example: Sync with external system
  // await syncToExternalSystem(data)
}

/**
 * Handle ${ctx.pluginId}:${ctx.resourceNameLower}-deleted event
 * 
 * Emitted when a ${ctx.resourceNameLower} is deleted.
 * 
 * @param data - Event data containing the deleted ${ctx.resourceNameLower} ID
 */
export async function handle${ctx.resourceNamePascal}Deleted(data: any): Promise<void> {
  console.log('${ctx.pluginName}: ${ctx.resourceName} deleted', data)
  
  // Example: Cleanup related data
  // await cleanupRelatedData(data.id)
  
  // Example: Archive the record
  // await archiveRecord(data.id)
}

/**
 * Example: Handle custom event from another plugin
 * 
 * If your plugin integrates with other plugins, you can listen to their events.
 * For example, listening to inventory changes, order creation, etc.
 * 
 * @param data - Event data from the other plugin
 */
export async function handleExternalPluginEvent(data: any): Promise<void> {
  console.log('${ctx.pluginName}: Received external event', data)
  
  // React to events from other plugins
  // This enables powerful integrations without tight coupling
}

/**
 * Default export for event handlers
 * Maps event names to handler functions
 */
export default {
  'core:user-logged-in': handleUserLoggedIn,
  'core:user-logged-out': handleUserLoggedOut,
  '${ctx.pluginId}:${ctx.resourceNameLower}-created': handle${ctx.resourceNamePascal}Created,
  '${ctx.pluginId}:${ctx.resourceNameLower}-updated': handle${ctx.resourceNamePascal}Updated,
  '${ctx.pluginId}:${ctx.resourceNameLower}-deleted': handle${ctx.resourceNamePascal}Deleted,
}
`
}

