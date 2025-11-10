import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePluginContext } from '@/lib/plugin-system'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core-erp/ui/components/ui'
import { Badge } from '@core-erp/ui/components/ui'
import { Package, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import { PageHeader } from '@core-erp/ui/components/responsive'
import { PageContainer } from '@core-erp/ui/components/responsive'
import type { LoadedPlugin } from '@/lib/plugin-system/types'

export default function Plugins() {
  const { t } = useTranslation('common')
  const { manager } = usePluginContext()

  // Get all plugins
  const allPlugins = useMemo(() => {
    return manager.getAllPlugins()
  }, [manager])

  const enabledCount = allPlugins.filter(p => p.enabled).length
  const disabledCount = allPlugins.filter(p => !p.enabled).length
  const errorPlugins = allPlugins.filter(p => p.status === 'error')

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      operations: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      sales: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      finance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      hr: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      analytics: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      integration: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      utility: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      custom: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    }
    return colors[category] || colors.custom
  }

  const getStatusBadge = (plugin: LoadedPlugin) => {
    if (plugin.status === 'error') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Error
        </Badge>
      )
    }
    
    if (plugin.enabled) {
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Enabled
        </Badge>
      )
    }
    
    return (
      <Badge variant="secondary" className="gap-1">
        <XCircle className="h-3 w-3" />
        Disabled
      </Badge>
    )
  }

  return (
    <AppLayout>
      <div>
        <PageHeader
          title="Plugins"
          subtitle="Manage and monitor all installed plugins"
        />

        <PageContainer className="py-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Plugins</CardDescription>
                <CardTitle className="text-3xl">{allPlugins.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Enabled
                </CardDescription>
                <CardTitle className="text-3xl">{enabledCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  {errorPlugins.length > 0 ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Errors
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      Disabled
                    </>
                  )}
                </CardDescription>
                <CardTitle className="text-3xl">
                  {errorPlugins.length > 0 ? errorPlugins.length : disabledCount}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Plugin List */}
          {allPlugins.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Plugins Installed</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  No plugins are currently installed. Install plugins by adding them to your{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">plugins.config.ts</code> file.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {allPlugins.map((plugin) => (
                <Card key={plugin.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg truncate">
                            {plugin.manifest.name}
                          </CardTitle>
                          {getStatusBadge(plugin)}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {plugin.manifest.description}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className={getCategoryColor(plugin.manifest.category)}>
                        {plugin.manifest.category}
                      </Badge>
                      <Badge variant="outline">v{plugin.manifest.version}</Badge>
                      {plugin.manifest.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Plugin ID:</dt>
                        <dd className="font-mono text-xs">{plugin.id}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Author:</dt>
                        <dd>{plugin.manifest.author}</dd>
                      </div>
                      {plugin.manifest.license && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">License:</dt>
                          <dd>{plugin.manifest.license}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Status:</dt>
                        <dd className="capitalize">{plugin.status}</dd>
                      </div>
                      {plugin.routes && plugin.routes.length > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Routes:</dt>
                          <dd>{plugin.routes.length}</dd>
                        </div>
                      )}
                      {plugin.menuItems && plugin.menuItems.length > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Menu Items:</dt>
                          <dd>{plugin.menuItems.length}</dd>
                        </div>
                      )}
                      {plugin.permissions && plugin.permissions.length > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Permissions:</dt>
                          <dd>{plugin.permissions.length}</dd>
                        </div>
                      )}
                      {plugin.manifest.homepage && (
                        <div className="pt-2">
                          <a
                            href={plugin.manifest.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-xs flex items-center gap-1"
                          >
                            View Documentation
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </dl>

                    {plugin.status === 'error' && (
                      <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-xs text-destructive font-medium">
                          This plugin encountered an error during initialization.
                          Check the console for details.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">How to Add Plugins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">1. Install the plugin package:</p>
                <code className="block bg-background p-2 rounded text-xs">
                  npm install @core-erp/plugin-name
                </code>
              </div>
              <div>
                <p className="font-medium mb-1">2. Add to <code>plugins.config.ts</code>:</p>
                <code className="block bg-background p-2 rounded text-xs whitespace-pre">
{`{
  package: '@core-erp/plugin-name',
  enabled: true,
  config: { /* plugin settings */ }
}`}
                </code>
              </div>
              <div>
                <p className="font-medium mb-1">3. Restart the application:</p>
                <code className="block bg-background p-2 rounded text-xs">
                  npm run dev
                </code>
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </div>
    </AppLayout>
  )
}

