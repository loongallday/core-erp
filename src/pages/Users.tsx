import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUsers, useAuth } from '@core-erp/entity'
import { AppLayout } from '@/components/AppLayout'
import { PageContainer } from '@core-erp/ui/components/responsive'
import { PageHeader } from '@core-erp/ui/components/responsive'
import { ResponsiveButton } from '@core-erp/ui/components/responsive'
import { ResponsiveTable } from '@core-erp/ui/components/responsive'
import { Card, CardContent } from '@core-erp/ui/components/ui'
import { Button } from '@core-erp/ui/components/ui'
import { Badge } from '@core-erp/ui/components/ui'
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@core-erp/ui/components/ui'
import { SkeletonTable } from '@core-erp/ui/components/loading'
import { Plus, Users as UsersIcon } from 'lucide-react'

const UserTableRow = memo(({ user, onView, t }: { user: any; onView: (id: string) => void; t: any }) => (
  <TableRow>
    <TableCell className="font-medium sticky left-0 bg-card z-10">{user.name}</TableCell>
    <TableCell>{user.email}</TableCell>
    <TableCell>
      <div className="flex gap-1 flex-wrap">
        {user.roles?.map((ur: any) => (
          <Badge key={ur.role.id} variant="secondary">
            {ur.role.name}
          </Badge>
        ))}
      </div>
    </TableCell>
    <TableCell>
      <Badge variant={user.is_active ? 'default' : 'secondary'}>
        {user.is_active ? t('common:status.active') : t('common:status.inactive')}
      </Badge>
    </TableCell>
    <TableCell>
      <Button size="sm" variant="ghost" onClick={() => onView(user.id)}>
        {t('common:actions.view')}
      </Button>
    </TableCell>
  </TableRow>
))

UserTableRow.displayName = 'UserTableRow'

export default function Users() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const { t } = useTranslation(['users', 'common'])
  const { data: users = [], isLoading } = useUsers()

  const handleViewUser = useCallback((id: string) => {
    navigate(`/users/${id}`)
  }, [navigate])

  return (
    <AppLayout>
      <div>
        <PageHeader
          title={t('users:title')}
          subtitle={t('users:subtitle')}
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
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <SkeletonTable rows={5} columns={5} />
              ) : users.length === 0 ? (
                <div className="p-12 text-center">
                  <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">{t('users:messages.no_users')}</p>
                  {hasPermission('users:create') && (
                    <ResponsiveButton onClick={() => navigate('/users/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('users:actions.add_user')}
                    </ResponsiveButton>
                  )}
                </div>
              ) : (
                <ResponsiveTable minWidth="640px">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-card z-10">{t('users:table.name')}</TableHead>
                      <TableHead>{t('users:table.email')}</TableHead>
                      <TableHead>{t('users:table.roles')}</TableHead>
                      <TableHead>{t('users:table.status')}</TableHead>
                      <TableHead>{t('users:table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <UserTableRow key={user.id} user={user} onView={handleViewUser} t={t} />
                    ))}
                  </TableBody>
                </ResponsiveTable>
              )}
            </CardContent>
          </Card>
        </PageContainer>
      </div>
    </AppLayout>
  )
}

