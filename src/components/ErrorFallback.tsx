import { ErrorInfo } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@core-erp/ui/components/ui'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@core-erp/ui/components/ui'
import { Alert, AlertDescription } from '@core-erp/ui/components/ui'

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  onReset: () => void
}

/**
 * Error Fallback UI Component
 * 
 * Displays a user-friendly error message when an error is caught by ErrorBoundary.
 * Provides options to refresh the page or return to home.
 */
export function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  const isDev = import.meta.env.DEV

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    onReset()
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. We apologize for the inconvenience.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isDev && error && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Error: {error.message}</p>
                  {error.stack && (
                    <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-black/10 rounded">
                      {error.stack}
                    </pre>
                  )}
                  {errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium">
                        Component Stack
                      </summary>
                      <pre className="mt-1 text-xs overflow-auto max-h-40 p-2 bg-black/10 rounded">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!isDev && (
            <p className="text-sm text-muted-foreground">
              The error has been logged and our team will investigate the issue. 
              You can try refreshing the page or return to the home page.
            </p>
          )}
        </CardContent>

        <CardFooter className="flex gap-3 flex-col sm:flex-row">
          <Button onClick={handleRefresh} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
          <Button onClick={handleGoHome} variant="outline" className="w-full sm:w-auto">
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
