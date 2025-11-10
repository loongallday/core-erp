import { useTranslation } from 'react-i18next'
import { useRoles } from '@/hooks/useRoles'
import { AppLayout } from '@/components/AppLayout'
import { PageContainer } from '@core-erp/ui/components/responsive'
import { PageHeader } from '@core-erp/ui/components/responsive'
import { ResponsiveGrid } from '@core-erp/ui/components/responsive'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core-erp/ui/components/ui'
import { Badge } from '@core-erp/ui/components/ui'
import { SkeletonCard } from '@core-erp/ui/components/loading'
import { Shield } from 'lucide-react'

export default function Roles() {
  const { t } = useTranslation(['roles', 'common'])
  const { data: roles = [], isLoading } = useRoles()

  return (
    <AppLayout>
      <div>
        <PageHeader
          title={t('roles:title')}
          subtitle={t('roles:subtitle')}
        />

        <PageContainer className="py-6">
          {isLoading ? (
            <ResponsiveGrid minWidth="280px" gap={4}>
              <SkeletonCard hasHeader={true} lines={2} />
              <SkeletonCard hasHeader={true} lines={2} />
              <SkeletonCard hasHeader={true} lines={2} />
              <SkeletonCard hasHeader={true} lines={2} />
            </ResponsiveGrid>
          ) : (
            <ResponsiveGrid minWidth="280px" gap={4}>
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {role.name}
                      </span>
                      {role.is_system && <Badge variant="secondary">{t('roles:fields.is_system')}</Badge>}
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('roles:fields.level')}:</span>
                        <span className="font-medium">{role.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Code:</span>
                        <span className="font-mono text-xs">{role.code}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          )}
        </PageContainer>
      </div>
    </AppLayout>
  )
}

