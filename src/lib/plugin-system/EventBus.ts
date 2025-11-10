/**
 * Event Bus
 * 
 * Facilitates inter-plugin communication through events.
 * Plugins can emit events and listen to events from other plugins or core.
 */

import { logDebug, logError } from '../logger'

export class EventBus {
  private listeners: Map<string, Set<Function>> = new Map()
  private eventHistory: Array<{ event: string; data: any; timestamp: Date }> = []
  private maxHistorySize: number = 100

  /**
   * Emit an event
   */
  emit(eventName: string, data: any): void {
    logDebug(`Emitting event: ${eventName}`, { 
      component: 'EventBus',
      eventName 
    })

    // Store in history
    this.eventHistory.push({
      event: eventName,
      data,
      timestamp: new Date(),
    })

    // Keep history size manageable
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Get all listeners for this event
    const eventListeners = this.listeners.get(eventName)
    
    if (!eventListeners || eventListeners.size === 0) {
      logDebug(`No listeners for event: ${eventName}`, { 
        component: 'EventBus',
        eventName 
      })
      return
    }

    // Call all listeners
    let successCount = 0
    let errorCount = 0

    for (const handler of eventListeners) {
      try {
        handler(data)
        successCount++
      } catch (error) {
        errorCount++
        logError(`Error in event handler for ${eventName}`, error as Error, { 
          component: 'EventBus',
          eventName 
        })
      }
    }

    logDebug(
      `Event ${eventName} delivered to ${successCount} listeners`,
      { 
        component: 'EventBus',
        eventName,
        successCount,
        errorCount 
      }
    )
  }

  /**
   * Listen to an event
   */
  on(eventName: string, handler: Function): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set())
    }

    this.listeners.get(eventName)!.add(handler)
    logDebug(`Registered listener for: ${eventName}`, { 
      component: 'EventBus',
      eventName 
    })

    // Return unsubscribe function
    return () => this.off(eventName, handler)
  }

  /**
   * Listen to an event only once
   */
  once(eventName: string, handler: Function): () => void {
    const wrappedHandler = (data: any) => {
      handler(data)
      this.off(eventName, wrappedHandler)
    }

    return this.on(eventName, wrappedHandler)
  }

  /**
   * Remove a specific listener
   */
  off(eventName: string, handler: Function): boolean {
    const eventListeners = this.listeners.get(eventName)
    
    if (!eventListeners) {
      return false
    }

    const removed = eventListeners.delete(handler)

    // Clean up empty listener sets
    if (eventListeners.size === 0) {
      this.listeners.delete(eventName)
    }

    if (removed) {
      logDebug(`Removed listener for: ${eventName}`, { 
        component: 'EventBus',
        eventName 
      })
    }

    return removed
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName)
      logDebug(`Removed all listeners for: ${eventName}`, { 
        component: 'EventBus',
        eventName 
      })
    } else {
      this.listeners.clear()
      logDebug('Removed all listeners', { component: 'EventBus' })
    }
  }

  /**
   * Get all event names that have listeners
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(eventName?: string): number {
    if (eventName) {
      return this.listeners.get(eventName)?.size || 0
    }

    // Total listener count
    let total = 0
    for (const listeners of this.listeners.values()) {
      total += listeners.size
    }
    return total
  }

  /**
   * Check if an event has listeners
   */
  hasListeners(eventName: string): boolean {
    const listeners = this.listeners.get(eventName)
    return listeners !== undefined && listeners.size > 0
  }

  /**
   * Get event history
   */
  getHistory(limit?: number): Array<{ event: string; data: any; timestamp: Date }> {
    if (limit) {
      return this.eventHistory.slice(-limit)
    }
    return [...this.eventHistory]
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = []
    logDebug('Event history cleared', { component: 'EventBus' })
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalListeners: this.getListenerCount(),
      uniqueEvents: this.listeners.size,
      historySize: this.eventHistory.length,
      events: this.getEventNames().map(name => ({
        name,
        listenerCount: this.getListenerCount(name),
      })),
    }
  }

  /**
   * Wait for an event (returns promise)
   */
  waitFor(eventName: string, timeout?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null

      const handler = (data: any) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        resolve(data)
      }

      this.once(eventName, handler)

      if (timeout) {
        timeoutId = setTimeout(() => {
          this.off(eventName, handler)
          reject(new Error(`Timeout waiting for event: ${eventName}`))
        }, timeout)
      }
    })
  }

  /**
   * Emit event and wait for all listeners to complete
   */
  async emitAsync(eventName: string, data: any): Promise<any[]> {
    logDebug(`Emitting async event: ${eventName}`, { 
      component: 'EventBus',
      eventName 
    })

    const eventListeners = this.listeners.get(eventName)
    
    if (!eventListeners || eventListeners.size === 0) {
      logDebug(`No listeners for event: ${eventName}`, { 
        component: 'EventBus',
        eventName 
      })
      return []
    }

    // Convert to array and call all handlers
    const promises = Array.from(eventListeners).map(async (handler) => {
      try {
        return await handler(data)
      } catch (error) {
        logError(`Error in async event handler for ${eventName}`, error as Error, { 
          component: 'EventBus',
          eventName 
        })
        throw error
      }
    })

    return await Promise.all(promises)
  }

  /**
   * Create a namespaced event emitter for a plugin
   */
  createNamespace(namespace: string) {
    return {
      emit: (eventName: string, data: any) => 
        this.emit(`${namespace}:${eventName}`, data),
      on: (eventName: string, handler: Function) => 
        this.on(`${namespace}:${eventName}`, handler),
      once: (eventName: string, handler: Function) => 
        this.once(`${namespace}:${eventName}`, handler),
      off: (eventName: string, handler: Function) => 
        this.off(`${namespace}:${eventName}`, handler),
    }
  }
}

