/**
 * Utility Functions for Plugin Template Generator
 * 
 * This module provides helper functions for string manipulation, validation,
 * and common operations used throughout the generator.
 */

import path from 'path'
import fs from 'fs-extra'

/**
 * Converts a string to kebab-case format
 * 
 * @example
 * kebabCase('My Plugin Name') // returns 'my-plugin-name'
 * kebabCase('Inventory Management') // returns 'inventory-management'
 * 
 * @param str - The string to convert
 * @returns The kebab-cased string
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * Converts a string to PascalCase format
 * 
 * @example
 * pascalCase('my plugin name') // returns 'MyPluginName'
 * pascalCase('inventory-management') // returns 'InventoryManagement'
 * 
 * @param str - The string to convert
 * @returns The PascalCased string
 */
export function pascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (char) => char.toUpperCase())
}

/**
 * Converts a string to camelCase format
 * 
 * @example
 * camelCase('My Plugin Name') // returns 'myPluginName'
 * camelCase('inventory-management') // returns 'inventoryManagement'
 * 
 * @param str - The string to convert
 * @returns The camelCased string
 */
export function camelCase(str: string): string {
  const pascal = pascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/**
 * Converts a string to snake_case format
 * 
 * @example
 * snakeCase('My Plugin Name') // returns 'my_plugin_name'
 * snakeCase('InventoryManagement') // returns 'inventory_management'
 * 
 * @param str - The string to convert
 * @returns The snake_cased string
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
}

/**
 * Pluralizes a word (simple English pluralization)
 * 
 * Note: This is a simple implementation. For complex pluralization,
 * consider using a library like 'pluralize'.
 * 
 * @example
 * pluralize('item') // returns 'items'
 * pluralize('category') // returns 'categories'
 * pluralize('person') // returns 'people'
 * 
 * @param word - The word to pluralize
 * @returns The pluralized word
 */
export function pluralize(word: string): string {
  const lower = word.toLowerCase()
  
  // Special cases
  const irregular: Record<string, string> = {
    'person': 'people',
    'man': 'men',
    'woman': 'women',
    'child': 'children',
    'tooth': 'teeth',
    'foot': 'feet',
    'mouse': 'mice',
    'goose': 'geese',
  }
  
  if (irregular[lower]) {
    return irregular[lower]
  }
  
  // Ends with 'y' preceded by consonant
  if (/[^aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies'
  }
  
  // Ends with 's', 'x', 'z', 'ch', 'sh'
  if (/(?:s|x|z|ch|sh)$/i.test(word)) {
    return word + 'es'
  }
  
  // Default: add 's'
  return word + 's'
}

/**
 * Validates a plugin name
 * 
 * Plugin names should:
 * - Start with a letter
 * - Contain only letters, numbers, spaces, and hyphens
 * - Be between 2 and 50 characters
 * 
 * @param name - The plugin name to validate
 * @returns An object with `valid` boolean and optional `error` message
 */
export function validatePluginName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Plugin name is required' }
  }
  
  if (name.length < 2) {
    return { valid: false, error: 'Plugin name must be at least 2 characters' }
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'Plugin name must be less than 50 characters' }
  }
  
  if (!/^[a-zA-Z]/.test(name)) {
    return { valid: false, error: 'Plugin name must start with a letter' }
  }
  
  if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
    return { valid: false, error: 'Plugin name can only contain letters, numbers, spaces, and hyphens' }
  }
  
  return { valid: true }
}

/**
 * Validates a directory path
 * 
 * @param dirPath - The directory path to validate
 * @returns An object with `valid` boolean and optional `error` message
 */
export function validateDirectory(dirPath: string): { valid: boolean; error?: string } {
  if (!dirPath || dirPath.trim().length === 0) {
    return { valid: false, error: 'Directory path is required' }
  }
  
  const absolutePath = path.isAbsolute(dirPath) ? dirPath : path.resolve(process.cwd(), dirPath)
  
  // Check if path already exists
  if (fs.existsSync(absolutePath)) {
    return { valid: false, error: 'Directory already exists. Please choose a different path.' }
  }
  
  // Check if parent directory exists and is writable
  const parentDir = path.dirname(absolutePath)
  if (!fs.existsSync(parentDir)) {
    return { valid: false, error: 'Parent directory does not exist' }
  }
  
  try {
    fs.accessSync(parentDir, fs.constants.W_OK)
  } catch {
    return { valid: false, error: 'Parent directory is not writable' }
  }
  
  return { valid: true }
}

/**
 * Ensures a directory exists, creating it if necessary
 * 
 * @param dirPath - The directory path
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath)
}

/**
 * Writes a file with the given content
 * 
 * @param filePath - The file path
 * @param content - The file content
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, 'utf-8')
}

/**
 * Gets the current year for copyright notices
 * 
 * @returns The current year as a string
 */
export function getCurrentYear(): string {
  return new Date().getFullYear().toString()
}

/**
 * Formats a list of items as a bulleted list
 * 
 * @param items - Array of items
 * @returns Formatted bulleted list string
 */
export function formatBulletList(items: string[]): string {
  return items.map(item => `  - ${item}`).join('\n')
}

/**
 * Indents text by a specified number of spaces
 * 
 * @param text - The text to indent
 * @param spaces - Number of spaces to indent (default: 2)
 * @returns Indented text
 */
export function indent(text: string, spaces: number = 2): string {
  const indentation = ' '.repeat(spaces)
  return text.split('\n').map(line => indentation + line).join('\n')
}

