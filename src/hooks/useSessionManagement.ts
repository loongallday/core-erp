/**
 * Session Management Hook
 * 
 * Handles cross-tab logout synchronization
 * Note: Supabase handles session refresh automatically, we don't need to do it manually
 */

import { useEffect, useRef, useCallback } from 'react'
import { Session } from '@supabase/supabase-js'
import { AUTH_SYNC_CHANNEL } from '@/lib/constants'

interface SessionManagementOptions {
  /** Current session */
  session: Session | null
  /** Whether user is online */
  isOnline: boolean
  /** Callback when logout is triggered from another tab */
  onExternalLogout?: () => void
}

interface BroadcastMessage {
  type: 'logout' | 'login'
  timestamp: number
}

export function useSessionManagement({
  session,
  isOnline,
  onExternalLogout,
}: SessionManagementOptions) {
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null)

  // Initialize BroadcastChannel for cross-tab communication
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(AUTH_SYNC_CHANNEL)
      
      channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        const { type } = event.data

        // If another tab logged out, trigger logout in this tab
        if (type === 'logout' && onExternalLogout) {
          onExternalLogout()
        }
      }

      broadcastChannelRef.current = channel

      return () => {
        channel.close()
        broadcastChannelRef.current = null
      }
    }
  }, [onExternalLogout])

  // Broadcast session changes to other tabs
  const broadcastSessionChange = useCallback((type: BroadcastMessage['type']) => {
    if (broadcastChannelRef.current) {
      const message: BroadcastMessage = {
        type,
        timestamp: Date.now(),
      }
      broadcastChannelRef.current.postMessage(message)
    }
  }, [])

  return {
    broadcastLogout: () => broadcastSessionChange('logout'),
    broadcastLogin: () => broadcastSessionChange('login'),
  }
}

