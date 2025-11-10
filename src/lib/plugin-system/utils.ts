/**
 * Shared Utilities for Plugin System
 * 
 * Common functions used across multiple plugin system modules.
 */

/**
 * Navigate through an object using dot notation path
 * @example getNestedValue({a: {b: {c: 1}}}, 'a.b.c') // returns 1
 */
export function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined
    }
    current = current[key]
  }

  return current
}

/**
 * Set a nested value in an object using dot notation path
 * @example setNestedValue({}, 'a.b.c', 1) // creates {a: {b: {c: 1}}}
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

/**
 * Deep merge two objects (source takes precedence)
 */
export function deepMerge(target: any, source: any): any {
  if (!source) return target
  if (!target) return source

  const result = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result
}

/**
 * Extract plugin ID from package name
 * @example extractPluginId('@my-org/plugin-inventory') // returns 'inventory'
 */
export function extractPluginId(packageName: string): string {
  if (packageName.startsWith('@')) {
    const parts = packageName.split('/')
    if (parts.length === 2) {
      return parts[1].replace('plugin-', '')
    }
  }
  return packageName.replace('plugin-', '')
}

