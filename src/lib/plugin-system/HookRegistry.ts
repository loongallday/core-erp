/**
 * Hook Registry
 * 
 * Manages lifecycle hooks and extension points in the plugin system.
 * Allows plugins to extend core functionality at specific points.
 */

export class HookRegistry {
  private hooks: Map<string, Function[]> = new Map()

  /**
   * Register a hook callback
   */
  register(hookName: string, callback: Function, priority: number = 10): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, [])
    }

    const callbacks = this.hooks.get(hookName)!
    
    // Store callback with priority
    const wrappedCallback: any = callback
    wrappedCallback.__priority = priority

    callbacks.push(wrappedCallback)

    // Sort by priority (lower number = higher priority)
    callbacks.sort((a: any, b: any) => (a.__priority || 10) - (b.__priority || 10))

    console.log(`[HookRegistry] Registered hook: ${hookName} (priority: ${priority})`)
  }

  /**
   * Unregister a hook callback
   */
  unregister(hookName: string, callback: Function): boolean {
    const callbacks = this.hooks.get(hookName)
    
    if (!callbacks) {
      return false
    }

    const index = callbacks.indexOf(callback)
    if (index === -1) {
      return false
    }

    callbacks.splice(index, 1)

    // Clean up empty hook arrays
    if (callbacks.length === 0) {
      this.hooks.delete(hookName)
    }

    console.log(`[HookRegistry] Unregistered hook: ${hookName}`)
    return true
  }

  /**
   * Execute a hook with sequential callback execution
   * Each callback receives the result of the previous callback
   */
  async execute(hookName: string, ...args: any[]): Promise<any> {
    const callbacks = this.hooks.get(hookName)
    
    if (!callbacks || callbacks.length === 0) {
      // No hooks registered, return first argument unchanged
      return args[0]
    }

    console.log(`[HookRegistry] Executing hook: ${hookName} (${callbacks.length} callbacks)`)

    let result = args[0]
    const otherArgs = args.slice(1)

    for (const callback of callbacks) {
      try {
        result = await callback(result, ...otherArgs)
      } catch (error) {
        console.error(`[HookRegistry] Error executing hook ${hookName}:`, error)
        throw error
      }
    }

    return result
  }

  /**
   * Execute all callbacks in parallel
   */
  async executeParallel(hookName: string, ...args: any[]): Promise<any[]> {
    const callbacks = this.hooks.get(hookName)
    
    if (!callbacks || callbacks.length === 0) {
      return []
    }

    console.log(`[HookRegistry] Executing hook in parallel: ${hookName}`)

    const promises = callbacks.map(callback => callback(...args))
    return await Promise.all(promises)
  }

  /**
   * Execute callbacks and collect results
   */
  async collect(hookName: string, ...args: any[]): Promise<any[]> {
    const callbacks = this.hooks.get(hookName)
    
    if (!callbacks || callbacks.length === 0) {
      return []
    }

    console.log(`[HookRegistry] Collecting hook results: ${hookName}`)

    const results: any[] = []

    for (const callback of callbacks) {
      try {
        const result = await callback(...args)
        if (result !== undefined) {
          results.push(result)
        }
      } catch (error) {
        console.error(`[HookRegistry] Error collecting from hook ${hookName}:`, error)
      }
    }

    return results
  }

  /**
   * Execute until first callback returns truthy value
   */
  async executeUntil(hookName: string, ...args: any[]): Promise<any> {
    const callbacks = this.hooks.get(hookName)
    
    if (!callbacks || callbacks.length === 0) {
      return null
    }

    console.log(`[HookRegistry] Executing hook until result: ${hookName}`)

    for (const callback of callbacks) {
      try {
        const result = await callback(...args)
        if (result) {
          return result
        }
      } catch (error) {
        console.error(`[HookRegistry] Error in hook ${hookName}:`, error)
      }
    }

    return null
  }

  /**
   * Check if a hook has callbacks
   */
  hasHook(hookName: string): boolean {
    const callbacks = this.hooks.get(hookName)
    return callbacks !== undefined && callbacks.length > 0
  }

  /**
   * Get number of callbacks for a hook
   */
  getCallbackCount(hookName: string): number {
    return this.hooks.get(hookName)?.length || 0
  }

  /**
   * Get all registered hook names
   */
  getHookNames(): string[] {
    return Array.from(this.hooks.keys())
  }

  /**
   * Get total hook count
   */
  getHookCount(): number {
    return this.hooks.size
  }

  /**
   * Clear all hooks
   */
  clear(hookName?: string): void {
    if (hookName) {
      this.hooks.delete(hookName)
      console.log(`[HookRegistry] Cleared hooks for: ${hookName}`)
    } else {
      this.hooks.clear()
      console.log('[HookRegistry] Cleared all hooks')
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const hooks = this.getHookNames().map(name => ({
      name,
      callbackCount: this.getCallbackCount(name),
    }))

    return {
      totalHooks: this.hooks.size,
      totalCallbacks: Array.from(this.hooks.values()).reduce((sum, cbs) => sum + cbs.length, 0),
      hooks,
    }
  }

  /**
   * Create pre-defined hook names (for documentation)
   */
  static readonly CORE_HOOKS = {
    // User hooks
    'user:created': 'Called after a user is created',
    'user:updated': 'Called after a user is updated',
    'user:deleted': 'Called after a user is deleted',
    
    // Role hooks
    'role:created': 'Called after a role is created',
    'role:updated': 'Called after a role is updated',
    'role:deleted': 'Called after a role is deleted',
    
    // Permission hooks
    'permission:granted': 'Called after a permission is granted',
    'permission:revoked': 'Called after a permission is revoked',
    
    // UI hooks
    'dashboard:stats': 'Add custom stats to dashboard',
    'dashboard:widgets': 'Add custom widgets to dashboard',
    'user:detail:tabs': 'Add tabs to user detail page',
    'role:detail:sections': 'Add sections to role detail page',
    
    // Data hooks
    'export:data': 'Transform data before export',
    'import:data': 'Transform data after import',
    'search:results': 'Modify search results',
    'filter:data': 'Add custom filters',
    
    // System hooks
    'app:startup': 'Called when app starts',
    'app:shutdown': 'Called when app shuts down',
    'plugin:loaded': 'Called after a plugin is loaded',
    'plugin:enabled': 'Called after a plugin is enabled',
  } as const

  /**
   * Get documentation for core hooks
   */
  getCoreHooks(): Record<string, string> {
    return { ...HookRegistry.CORE_HOOKS }
  }
}

