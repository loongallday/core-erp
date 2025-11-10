import { createContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { Session, User as SupabaseUser, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/database'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useSessionManagement } from '@/hooks/useSessionManagement'
import { withRetry } from '@/lib/authRetry'
import { RETURN_URL_KEY, SESSION_WARNING_THRESHOLDS } from '@/lib/constants'
import { toast } from '@core-erp/ui/hooks'

interface AuthContextType {
  session: Session | null
  authUser: SupabaseUser | null
  user: User | null
  permissions: string[]
  loading: boolean
  isOnline: boolean
  isReconnecting: boolean
  sessionExpiresAt: Date | null
  hasPermission: (code: string) => boolean
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  setIntendedDestination: (url: string) => void
  getAndClearReturnUrl: () => string | null
  isSessionExpiringSoon: (thresholdMs?: number) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use ref to prevent infinite loops in fetchUserProfile
  const isFetchingRef = useRef(false)

  // Network status monitoring
  const { isOnline, isReconnecting } = useNetworkStatus()

  // Handle logout from another tab
  const handleExternalLogout = useCallback(() => {
    setSession(null)
    setAuthUser(null)
    setUser(null)
    setPermissions([])
    setSessionExpiresAt(null)
    toast.info('You have been signed out from another tab.')
  }, [])

  // Session management (only for cross-tab sync, no auto-refresh)
  // Supabase handles session refresh automatically
  const sessionManagement = useSessionManagement({
    session: isInitialized ? session : null,
    isOnline,
    onExternalLogout: handleExternalLogout,
  })
  
  const fetchUserPermissions = useCallback(async (userId: string) => {
    try {
      // Fetch permissions without retry on initial load
      const { data, error } = await supabase.functions.invoke('get-user-permissions', {
        body: { user_id: userId }
      })

      if (error) throw error
      setPermissions(data?.permissions || [])
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setPermissions([])
    }
  }, [])

  const fetchUserProfile = useCallback(async (authUserId: string) => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('[AuthContext] Fetch already in progress, skipping')
      return
    }

    isFetchingRef.current = true
    
    try {
      // Fetch user profile without retry on initial load to prevent loops
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles:user_roles!user_roles_user_id_fkey(role:roles(*))
        `)
        .eq('auth_user_id', authUserId)
        .maybeSingle()

      if (error) throw error
      
      const userData = data as User | null
      setUser(userData)
      
      if (userData) {
        await fetchUserPermissions(userData.id)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Failed to load user profile. Please try refreshing.')
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [fetchUserPermissions])

  // Initial session setup - runs ONLY once on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthUser(session?.user ?? null)
      setSessionExpiresAt(session?.expires_at ? new Date(session.expires_at * 1000) : null)
      
      if (session?.user) {
        fetchUserProfile(session.user.id).finally(() => {
          setIsInitialized(true)
        })
      } else {
        setLoading(false)
        setIsInitialized(true)
      }
    })

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      // Skip INITIAL_SESSION event as it's already handled above
      if (event === 'INITIAL_SESSION') {
        return
      }
      
      setSession(session)
      setAuthUser(session?.user ?? null)
      setSessionExpiresAt(session?.expires_at ? new Date(session.expires_at * 1000) : null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
        
        // Broadcast login to other tabs
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          sessionManagement.broadcastLogin()
        }
      } else {
        setUser(null)
        setPermissions([])
        setLoading(false)
        
        // Broadcast logout to other tabs
        if (event === 'SIGNED_OUT') {
          sessionManagement.broadcastLogout()
        }
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasPermission = (code: string): boolean => {
    return permissions.includes(code)
  }

  const signInWithEmail = async (email: string) => {
    try {
      setLoading(true)
      
      // Use retry logic for sign in
      await withRetry(async () => {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })

        if (error) throw error
      })

      setLoading(false)
      return { error: null }
    } catch (error) {
      setLoading(false)
      return { error: error as Error }
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Use retry logic for sign in
      await withRetry(async () => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
      })

      setLoading(false)
      return { error: null }
    } catch (error) {
      setLoading(false)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      // Broadcast logout before actually signing out
      sessionManagement.broadcastLogout()
      
      await supabase.auth.signOut()
      setSession(null)
      setAuthUser(null)
      setUser(null)
      setPermissions([])
      setSessionExpiresAt(null)
      
      // Clear return URL on explicit logout
      localStorage.removeItem(RETURN_URL_KEY)
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out. Please try again.')
    }
  }

  const setIntendedDestination = (url: string) => {
    // Don't save login page as return URL
    if (url !== '/login') {
      localStorage.setItem(RETURN_URL_KEY, url)
    }
  }

  const getAndClearReturnUrl = (): string | null => {
    const returnUrl = localStorage.getItem(RETURN_URL_KEY)
    if (returnUrl) {
      localStorage.removeItem(RETURN_URL_KEY)
      return returnUrl
    }
    return null
  }

  const isSessionExpiringSoon = (thresholdMs: number = SESSION_WARNING_THRESHOLDS[0]): boolean => {
    if (!sessionExpiresAt) return false
    const timeUntilExpiry = sessionExpiresAt.getTime() - Date.now()
    return timeUntilExpiry > 0 && timeUntilExpiry <= thresholdMs
  }

  // Show network status changes
  useEffect(() => {
    if (!isOnline && session) {
      toast.warning('You are offline. Some features may not be available.')
    } else if (isOnline && session && isReconnecting) {
      toast.success('Back online. Connection restored.')
    }
  }, [isOnline, isReconnecting, session])

  return (
    <AuthContext.Provider
      value={{
        session,
        authUser,
        user,
        permissions,
        loading,
        isOnline,
        isReconnecting,
        sessionExpiresAt,
        hasPermission,
        signInWithEmail,
        signInWithPassword,
        signOut,
        setIntendedDestination,
        getAndClearReturnUrl,
        isSessionExpiringSoon,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

