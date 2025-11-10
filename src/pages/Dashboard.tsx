import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import { useUsers } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { usePermissions } from '@/hooks/usePermissions'
import { AppLayout } from '@/components/AppLayout'
import { PageContainer, PageHeader, ResponsiveGrid, ResponsiveStack, ResponsiveButton } from '@core-erp/ui/components/responsive'
import { Card, CardContent, CardHeader, CardTitle } from '@core-erp/ui/components/ui'
import { Button } from '@core-erp/ui/components/ui'
import { SkeletonCard } from '@core-erp/ui/components/loading'
import { Users, Shield, Key, Plus } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, hasPermission } = useAuth()
  const { t } = useTranslation(['common', 'users', 'roles'])
  const { data: users = [], isLoading: isLoadingUsers } = useUsers()
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles()
  const { data: permissions = [], isLoading: isLoadingPermissions } = usePermissions()

  const isLoading = isLoadingUsers || isLoadingRoles || isLoadingPermissions

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    totalRoles: roles.filter(r => r.is_active).length,
    totalPermissions: permissions.length,
  }

  return (
    <AppLayout>
      <div>
        <PageHeader
          title={t('common:navigation.dashboard')}
          subtitle={`Welcome back, ${user?.name}`}
          actions={
            hasPermission('users:create') && (
              <ResponsiveButton onClick={() => navigate('/users/new')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('users:actions.add_user')}
              </ResponsiveButton>
            )
          }
        />

        <PageContainer className="py-6">
          <ResponsiveGrid minWidth="250px" gap={4}>
            {isLoading ? (
              <>
                <SkeletonCard hasHeader={true} lines={1} />
                <SkeletonCard hasHeader={true} lines={1} />
                <SkeletonCard hasHeader={true} lines={1} />
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('users:title')}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.activeUsers} {t('common:status.active').toLowerCase()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('roles:title')}</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalRoles}</div>
                    <p className="text-xs text-muted-foreground">{t('common:status.active')} {t('roles:title').toLowerCase()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('common:navigation.permissions')}</CardTitle>
                    <Key className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPermissions}</div>
                    <p className="text-xs text-muted-foreground">{t('common:navigation.permissions')}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </ResponsiveGrid>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveStack direction="row" spacing={3}>
                {hasPermission('users:view') && (
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/users')}>
                    <Users className="h-4 w-4 mr-2" />
                    {t('users:title')}
                  </Button>
                )}
                {hasPermission('roles:view') && (
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/roles')}>
                    <Shield className="h-4 w-4 mr-2" />
                    {t('roles:title')}
                  </Button>
                )}
              </ResponsiveStack>
            </CardContent>
          </Card>
        </PageContainer>
      </div>
    </AppLayout>
  )
}

