import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@core-erp/entity'
import { useTranslation } from 'react-i18next'
import { Button } from '@core-erp/ui/components/ui'
import { Input } from '@core-erp/ui/components/ui'
import { Label } from '@core-erp/ui/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core-erp/ui/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@core-erp/ui/components/ui'
import { toast } from 'sonner'
import { Mail, Shield, KeyRound } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()
  const { signInWithEmail, signInWithPassword, session, getAndClearReturnUrl } = useAuth()
  const { t } = useTranslation(['auth', 'common'])

  // Redirect to intended destination after successful login
  useEffect(() => {
    if (session) {
      const returnUrl = getAndClearReturnUrl()
      navigate(returnUrl || '/dashboard', { replace: true })
    }
  }, [session, getAndClearReturnUrl, navigate])

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signInWithEmail(email)
      if (error) {
        toast.error(error.message || t('auth:errors.unknown_error'))
      } else {
        toast.success(t('auth:login.magic_link_sent'))
        setSent(true)
      }
    } catch {
      toast.error(t('common:status.error'))
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signInWithPassword(email, password)
      if (error) {
        toast.error(error.message || t('auth:errors.unknown_error'))
      } else {
        toast.success(t('common:status.success'))
      }
    } catch {
      toast.error(t('common:status.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Shield className="h-5 w-5 md:h-6 md:w-6" />
            {t('common:app_name')}
          </CardTitle>
          <CardDescription>{t('auth:login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-8">
              <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">{t('auth:login.magic_link_sent')}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('auth:login.magic_link_description')}
              </p>
              <Button variant="outline" onClick={() => setSent(false)} className="mt-4">
                {t('common:actions.back')}
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">
                  <KeyRound className="h-4 w-4 mr-2" />
                  {t('auth:login.password_label')}
                </TabsTrigger>
                <TabsTrigger value="magic">
                  <Mail className="h-4 w-4 mr-2" />
                  Magic Link
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="password" className="mt-4">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-password">{t('auth:login.email_label')}</Label>
                    <Input
                      id="email-password"
                      type="email"
                      placeholder={t('auth:login.email_placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="touch-target"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth:login.password_label')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('auth:login.password_placeholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="touch-target"
                    />
                  </div>
                  <Button type="submit" className="w-full touch-target" disabled={loading}>
                    {loading ? t('auth:login.signing_in') : t('auth:login.password_button')}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="magic" className="mt-4">
                <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-magic">{t('auth:login.email_label')}</Label>
                    <Input
                      id="email-magic"
                      type="email"
                      placeholder={t('auth:login.email_placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="touch-target"
                    />
                  </div>
                  <Button type="submit" className="w-full touch-target" disabled={loading}>
                    {loading ? t('common:status.loading') : t('auth:login.magic_link_button')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

