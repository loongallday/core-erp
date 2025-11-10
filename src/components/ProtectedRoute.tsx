import { ReactNode, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@core-erp/entity'
import { WifiOff } from 'lucide-react'
import { Alert, AlertDescription } from '@core-erp/ui/components/ui'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: string
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    session, 
    user, 
    loading, 
    hasPermission, 
    setIntendedDestination,
    isOnline,
    isReconnecting 
  } = useAuth()

  useEffect(() => {
    if (!loading && !session) {
      // Save current location before redirect
      const currentPath = location.pathname + location.search
      setIntendedDestination(currentPath)
      navigate('/login')
    }
  }, [session, loading, navigate, location, setIntendedDestination])

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || !user) {
    return null
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to view this page
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Show offline indicator */}
      {!isOnline && (
        <Alert variant="destructive" className="m-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            {isReconnecting 
              ? 'Reconnecting...' 
              : 'You are offline. Some features may not be available.'}
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  )
}
