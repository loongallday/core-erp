import { useState } from 'react'
import { useTranslations, useDeleteTranslation } from '@/hooks/useTranslations'
import { AppLayout } from '@/components/AppLayout'
import { PageContainer, PageHeader } from '@core-erp/ui/components/responsive'
import { Card, CardContent } from '@core-erp/ui/components/ui'
import { Button } from '@core-erp/ui/components/ui'
import { Input } from '@core-erp/ui/components/ui'
import { Badge } from '@core-erp/ui/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@core-erp/ui/components/ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@core-erp/ui/components/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@core-erp/ui/components/ui'
import { Plus, Search, Edit, Trash2, Languages, X } from 'lucide-react'
import { TranslationDialog } from './Translations/TranslationDialog'

export default function TranslationManagement() {
  const [locale, setLocale] = useState<string>('')
  const [namespace, setNamespace] = useState<string>('')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: translations = [], isLoading } = useTranslations({
    locale: locale || undefined,
    namespace: namespace || undefined,
    search: search || undefined,
  })

  const deleteTranslation = useDeleteTranslation()

  const handleDelete = () => {
    if (deleteId) {
      deleteTranslation.mutate(deleteId)
      setDeleteId(null)
    }
  }

  const locales = ['en', 'th']
  const namespaces = ['common', 'auth', 'users', 'roles', 'errors']

  const hasFilters = locale || namespace || search

  return (
    <AppLayout>
      <div>
        <PageHeader
          title="Translation Management"
          subtitle="Manage application translations for all languages"
          actions={
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Translation
            </Button>
          }
        />

        <PageContainer className="py-6 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Search */}
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search translations..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Locale Filter */}
                  <Select value={locale || 'all'} onValueChange={(val) => setLocale(val === 'all' ? '' : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locales" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locales</SelectItem>
                      {locales.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc === 'en' ? '🇺🇸 English' : '🇹🇭 ไทย'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Namespace Filter */}
                  <Select value={namespace || 'all'} onValueChange={(val) => setNamespace(val === 'all' ? '' : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Namespaces" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Namespaces</SelectItem>
                      {namespaces.map((ns) => (
                        <SelectItem key={ns} value={ns}>
                          {ns}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  {hasFilters && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLocale('')
                        setNamespace('')
                        setSearch('')
                      }}
                      className="sm:col-span-2 lg:col-span-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Results Count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{translations.length}</span>
                  <span>
                    {translations.length === 1 ? 'translation' : 'translations'} found
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translations List */}
          <Card>
            {isLoading ? (
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
                  <p className="text-sm text-muted-foreground">Loading translations...</p>
                </div>
              </CardContent>
            ) : translations.length === 0 ? (
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Languages className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {hasFilters ? 'No translations found' : 'No translations yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {hasFilters
                        ? 'Try adjusting your filters'
                        : 'Create your first translation to get started'}
                    </p>
                  </div>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Translation
                  </Button>
                </div>
              </CardContent>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="divide-y lg:hidden">
                  {translations.map((translation) => (
                    <div key={translation.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {translation.locale === 'en' ? '🇺🇸 EN' : '🇹🇭 TH'}
                          </Badge>
                          <Badge variant="secondary">{translation.namespace}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(translation.id)}
                            className="h-8 w-8 p-0"
                            aria-label="Edit translation"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit translation</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(translation.id)}
                            className="h-8 w-8 p-0"
                            aria-label="Delete translation"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete translation</span>
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Key</div>
                        <code className="text-xs bg-muted px-2 py-1 rounded break-all block">
                          {translation.key}
                        </code>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Value</div>
                        <p className="text-sm break-words">{translation.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-28">Locale</TableHead>
                        <TableHead className="w-36">Namespace</TableHead>
                        <TableHead className="w-64">Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="w-28 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {translations.map((translation) => (
                        <TableRow key={translation.id}>
                          <TableCell>
                            <Badge variant="outline" className="whitespace-nowrap">
                              {translation.locale === 'en' ? '🇺🇸 EN' : '🇹🇭 TH'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{translation.namespace}</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                              {translation.key}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md truncate" title={translation.value}>
                              {translation.value}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(translation.id)}
                                className="h-8 w-8 p-0"
                                aria-label="Edit translation"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit translation</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteId(translation.id)}
                                className="h-8 w-8 p-0"
                                aria-label="Delete translation"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete translation</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </Card>
        </PageContainer>
      </div>

      {/* Create/Edit Dialog */}
      <TranslationDialog
        translationId={editingId}
        open={isCreating || !!editingId}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false)
            setEditingId(null)
          }
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Translation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this translation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
