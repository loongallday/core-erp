/**
 * Auth Retry Utility
 * 
 * Provides exponential backoff retry logic for auth operations
 */

import { MAX_AUTH_RETRIES, AUTH_RETRY_BASE_DELAY_MS } from './constants'

interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  shouldRetry?: (error: Error) => boolean
}

/**
 * Determines if an error should be retried
 */
function shouldRetryError(error: Error): boolean {
  // Retry on network errors
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return true
  }

  // Retry on 5xx server errors (if error has status property)
  if ('status' in error && typeof error.status === 'number') {
    return error.status >= 500 && error.status < 600
  }

  // Retry on timeout errors
  if (error.message.includes('timeout')) {
    return true
  }

  return false
}

/**
 * Executes an async function with exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = MAX_AUTH_RETRIES,
    baseDelay = AUTH_RETRY_BASE_DELAY_MS,
    shouldRetry = shouldRetryError,
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry if this is the last attempt
      if (attempt === maxRetries) {
        break
      }

      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        throw lastError
      }

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt)
      
      console.warn(
        `Auth operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`,
        lastError
      )

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // All retries exhausted
  throw lastError
}

/**
 * Creates a retry wrapper for a function
 */
export function createRetryWrapper<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options?: RetryOptions
) {
  return async (...args: TArgs): Promise<TReturn> => {
    return withRetry(() => fn(...args), options)
  }
}

