import { useState } from 'react'
import { useTranslations, useDeleteTranslation } from '@/hooks/useTranslations'
import { AppLayout } from '@/components/AppLayout'
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
import { Plus, Search, Edit, Trash2, Languages } from 'lucide-react'
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

  // Get unique locales and namespaces for filters
  const locales = ['en', 'th']
  const namespaces = ['common', 'auth', 'users', 'roles', 'errors']

  return (
    <AppLayout>
      <div>
        <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Languages className="h-8 w-8" />
                  Translation Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage application translations for all languages
                </p>
              </div>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Translation
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search translations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={locale} onValueChange={setLocale}>
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

                <Select value={namespace} onValueChange={setNamespace}>
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

                {(locale || namespace || search) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLocale('')
                      setNamespace('')
                      setSearch('')
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="mt-4 flex gap-2 text-sm text-muted-foreground">
                <span>Total: {translations.length} translations</span>
              </div>
            </CardContent>
          </Card>

          {/* Translations Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">Loading translations...</div>
              ) : translations.length === 0 ? (
                <div className="p-12 text-center">
                  <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {search || locale || namespace
                      ? 'No translations match your filters'
                      : 'No translations yet'}
                  </p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Translation
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Locale</TableHead>
                        <TableHead>Namespace</TableHead>
                        <TableHead>Key</TableHead>
                        <TableHead className="min-w-52">Value</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {translations.map((translation) => (
                        <TableRow key={translation.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {translation.locale === 'en' ? '🇺🇸 EN' : '🇹🇭 TH'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{translation.namespace}</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {translation.key}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md truncate" title={translation.value}>
                              {translation.value}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(translation.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteId(translation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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

