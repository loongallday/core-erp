/**
 * Performance Monitoring Utilities
 * 
 * Utilities for monitoring and optimizing animation performance.
 * These are primarily for development use.
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Simple FPS monitor for development
 * Returns a function to stop monitoring
 */
export function startFPSMonitor(callback?: (fps: number) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  
  let frameCount = 0
  let lastTime = performance.now()
  let animationId: number

  const countFrame = () => {
    frameCount++
    const currentTime = performance.now()
    
    // Calculate FPS every second
    if (currentTime >= lastTime + 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
      
      if (callback) {
        callback(fps)
      } else {
        console.log(`FPS: ${fps}`)
      }
      
      frameCount = 0
      lastTime = currentTime
    }
    
    animationId = requestAnimationFrame(countFrame)
  }

  animationId = requestAnimationFrame(countFrame)

  // Return stop function
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}

/**
 * Measure animation frame timing
 */
export function measureFrameTiming(
  callback: (timing: { min: number; max: number; avg: number }) => void,
  duration: number = 5000
): () => void {
  if (typeof window === 'undefined') return () => {}

  const frameTimes: number[] = []
  let lastTime = performance.now()
  const startTime = lastTime
  let animationId: number

  const measureFrame = () => {
    const currentTime = performance.now()
    const frameTime = currentTime - lastTime
    frameTimes.push(frameTime)
    lastTime = currentTime

    // Stop after duration
    if (currentTime - startTime >= duration) {
      const min = Math.min(...frameTimes)
      const max = Math.max(...frameTimes)
      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length

      callback({ min, max, avg })
      return
    }

    animationId = requestAnimationFrame(measureFrame)
  }

  animationId = requestAnimationFrame(measureFrame)

  // Return stop function
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}

/**
 * Log performance metrics for a component render
 */
export function logRenderTime(componentName: string, startTime: number): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return
  
  const endTime = performance.now()
  const renderTime = endTime - startTime
  
  if (renderTime > 16.67) { // Slower than 60fps
    console.warn(`[Performance] ${componentName} render took ${renderTime.toFixed(2)}ms (target: <16.67ms for 60fps)`)
  }
}

/**
 * Detect if GPU acceleration is available
 */
export function isGPUAccelerationAvailable(): boolean {
  if (typeof window === 'undefined') return false

  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  return !!gl
}

/**
 * Performance observer for long tasks
 */
export function observeLongTasks(callback: (duration: number) => void): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {}
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Long tasks are > 50ms
        if (entry.duration > 50) {
          callback(entry.duration)
        }
      }
    })

    observer.observe({ entryTypes: ['longtask'] })

    return () => observer.disconnect()
    } catch {
    console.warn('Long task observation not supported')
    return () => {}
  }
}

/**
 * Get basic performance info
 */
export function getPerformanceInfo() {
  if (typeof window === 'undefined') return null

  return {
    prefersReducedMotion: prefersReducedMotion(),
    gpuAcceleration: isGPUAccelerationAvailable(),
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
  }
}

