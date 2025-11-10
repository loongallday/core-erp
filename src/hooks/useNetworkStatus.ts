/**
 * Network Status Hook
 * 
 * Monitors online/offline status and provides reconnection handling
 */

import { useState, useEffect, useCallback } from 'react'

interface UseNetworkStatusReturn {
  /** Whether the browser is currently online */
  isOnline: boolean
  /** Whether a reconnection is in progress */
  isReconnecting: boolean
  /** Manually trigger reconnection check */
  checkConnection: () => void
}

export function useNetworkStatus(
  onReconnect?: () => void | Promise<void>
): UseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isReconnecting, setIsReconnecting] = useState(false)

  const checkConnection = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false)
      return
    }

    setIsReconnecting(true)
    try {
      // Try to fetch a small resource to verify connection
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' })
      setIsOnline(true)
      
      // Trigger reconnection callback if provided
      if (onReconnect) {
        await onReconnect()
      }
      } catch {
      setIsOnline(false)
    } finally {
      setIsReconnecting(false)
    }
  }, [onReconnect])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Check connection and potentially trigger reconnection
      checkConnection()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsReconnecting(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [checkConnection])

  return {
    isOnline,
    isReconnecting,
    checkConnection,
  }
}

