/**
 * Core ERP Plugin Template Generator - Utility Functions
 * 
 * This module provides helper functions for string manipulation,
 * validation, and common operations used throughout the generator.
 */

/**
 * Converts a string to kebab-case (lowercase with hyphens)
 * 
 * @example
 * toKebabCase("Inventory Management") // "inventory-management"
 * toKebabCase("ItemName") // "item-name"
 * 
 * @param str - Input string
 * @returns Kebab-cased string
 */
export function toKebabCase(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
}

/**
 * Converts a string to camelCase
 * 
 * @example
 * toCamelCase("inventory-management") // "inventoryManagement"
 * toCamelCase("Item Name") // "itemName"
 * 
 * @param str - Input string
 * @returns camelCased string
 */
export function toCamelCase(str: string): string {
  return str
    .trim()
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, (char) => char.toLowerCase())
}

/**
 * Converts a string to PascalCase
 * 
 * @example
 * toPascalCase("inventory-management") // "InventoryManagement"
 * toPascalCase("item name") // "ItemName"
 * 
 * @param str - Input string
 * @returns PascalCased string
 */
export function toPascalCase(str: string): string {
  const camel = toCamelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * Converts a string to plural form (simple English rules)
 * 
 * @example
 * toPlural("item") // "items"
 * toPlural("category") // "categories"
 * toPlural("status") // "statuses"
 * 
 * @param str - Singular noun
 * @returns Plural form
 */
export function toPlural(str: string): string {
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies'
  }
  if (str.endsWith('s') || str.endsWith('x') || str.endsWith('z') || 
      str.endsWith('ch') || str.endsWith('sh')) {
    return str + 'es'
  }
  return str + 's'
}

/**
 * Validates plugin name format
 * Must be 2-50 characters, alphanumeric with spaces
 * 
 * @param name - Plugin name to validate
 * @returns Validation result with error message if invalid
 */
export function validatePluginName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Plugin name is required' }
  }
  
  const trimmed = name.trim()
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Plugin name must be at least 2 characters' }
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Plugin name must be at most 50 characters' }
  }
  
  if (!/^[a-zA-Z0-9\s-]+$/.test(trimmed)) {
    return { valid: false, error: 'Plugin name can only contain letters, numbers, spaces, and hyphens' }
  }
  
  return { valid: true }
}

/**
 * Validates resource name (for CRUD examples)
 * Must be a single word, alphanumeric
 * 
 * @param name - Resource name to validate
 * @returns Validation result with error message if invalid
 */
export function validateResourceName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Resource name is required' }
  }
  
  const trimmed = name.trim()
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Resource name must be at least 2 characters' }
  }
  
  if (trimmed.length > 30) {
    return { valid: false, error: 'Resource name must be at most 30 characters' }
  }
  
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(trimmed)) {
    return { valid: false, error: 'Resource name must start with a letter and contain only letters and numbers' }
  }
  
  return { valid: true }
}

/**
 * Validates output directory path
 * Must be a valid path that doesn't exist yet
 * 
 * @param path - Directory path to validate
 * @returns Validation result with error message if invalid
 */
export function validateOutputDir(path: string): { valid: boolean; error?: string } {
  if (!path || path.trim().length === 0) {
    return { valid: false, error: 'Output directory is required' }
  }
  
  const trimmed = path.trim()
  
  // Check for invalid characters (basic check)
  if (/[<>:"|?*]/.test(trimmed)) {
    return { valid: false, error: 'Output directory contains invalid characters' }
  }
  
  return { valid: true }
}

/**
 * Formats a file size in bytes to human-readable format
 * 
 * @example
 * formatBytes(1024) // "1.00 KB"
 * formatBytes(1536) // "1.50 KB"
 * 
 * @param bytes - Size in bytes
 * @returns Formatted string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Gets current year for copyright notices
 * 
 * @returns Current year as string
 */
export function getCurrentYear(): string {
  return new Date().getFullYear().toString()
}

/**
 * Gets current date in ISO format
 * 
 * @returns Current date as ISO string
 */
export function getCurrentDate(): string {
  return new Date().toISOString()
}

/**
 * Safely creates a package name from plugin ID
 * 
 * @example
 * createPackageName("inventory") // "@core-erp/plugin-inventory"
 * 
 * @param pluginId - Plugin ID in kebab-case
 * @returns Full package name
 */
export function createPackageName(pluginId: string): string {
  return `@core-erp/plugin-${pluginId}`
}

/**
 * Escapes special characters in a string for use in RegExp
 * 
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Indents a multi-line string by a specified number of spaces
 * 
 * @param str - String to indent
 * @param spaces - Number of spaces to indent
 * @returns Indented string
 */
export function indent(str: string, spaces: number): string {
  const indentation = ' '.repeat(spaces)
  return str.split('\n').map(line => indentation + line).join('\n')
}

/**
 * Wraps text to a specified line length
 * 
 * @param text - Text to wrap
 * @param maxLength - Maximum line length
 * @returns Wrapped text
 */
export function wrapText(text: string, maxLength: number): string {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  
  if (currentLine) lines.push(currentLine)
  
  return lines.join('\n')
}

