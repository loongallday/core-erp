/**
 * Environment-Aware Logger
 * 
 * Centralized logging utility that respects environment and log levels.
 * Silences logs in production unless they're errors.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  action?: string
  userId?: string
  [key: string]: any
}

class Logger {
  private isDevelopment: boolean
  private minLevel: LogLevel

  constructor() {
    this.isDevelopment = import.meta.env.DEV
    this.minLevel = this.isDevelopment ? 'debug' : 'warn'
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.minLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  /**
   * Info logs - only in development
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context))
    }
  }

  /**
   * Warning logs - always logged
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  /**
   * Error logs - always logged
   * Also sends to error tracking service in production
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const fullContext = {
        ...context,
        error: error?.message,
        stack: error?.stack,
      }
      console.error(this.formatMessage('error', message, fullContext))

      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      // if (!this.isDevelopment) {
      //   sendToErrorTracking(message, error, context)
      // }
    }
  }

  /**
   * Log performance metrics
   */
  perf(operation: string, duration: number, context?: LogContext): void {
    if (this.isDevelopment) {
      const perfContext = { ...context, duration: `${duration.toFixed(2)}ms` }
      this.debug(`Performance: ${operation}`, perfContext)
    }
  }

  /**
   * Group related logs (development only)
   */
  group(label: string, fn: () => void): void {
    if (this.isDevelopment) {
      console.group(label)
      fn()
      console.groupEnd()
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Convenience exports
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context)
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context)
export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context)
export const logError = (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context)
export const logPerf = (operation: string, duration: number, context?: LogContext) => logger.perf(operation, duration, context)
export const logGroup = (label: string, fn: () => void) => logger.group(label, fn)
