import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@core-erp/ui/components/ui'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@core-erp/ui/components/ui'
import { Home, Search, ArrowLeft } from 'lucide-react'

/**
 * 404 Not Found Page
 * 
 * Displayed when user navigates to a non-existent route
 */
export default function NotFound() {
  const navigate = useNavigate()
  const { t } = useTranslation('common')

  const handleGoHome = () => {
    navigate('/dashboard')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">404</CardTitle>
          <CardDescription className="text-lg">Page Not Found</CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <p className="text-sm text-muted-foreground">
            You can go back to the previous page or return to the dashboard.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleGoHome} 
            className="w-full sm:w-auto"
          >
            <Home className="h-4 w-4 mr-2" />
            {t('navigation.dashboard')}
          </Button>
          <Button 
            onClick={handleGoBack} 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
