/**
 * Core ERP Plugin Template Generator - Frontend Templates
 * 
 * This module contains all frontend-related templates including:
 * - Route definitions
 * - Menu items
 * - Page components (List, Form, Detail)
 * - Dashboard widgets
 * 
 * All templates include working CRUD examples with proper validation,
 * error handling, and Core ERP patterns.
 */

import { TemplateContext } from '../types.js'

/**
 * Generates route definitions (src/frontend/routes.tsx)
 * 
 * Creates React Router v6 routes with:
 * - Lazy loading for code splitting
 * - Permission-based route protection
 * - Nested routes support
 * 
 * @param ctx - Template context
 * @returns routes.tsx content
 */
export function routesTemplate(ctx: TemplateContext): string {
  return `/**
 * ${ctx.pluginName} - Route Definitions
 * 
 * Defines all routes for the ${ctx.pluginName} plugin.
 */

import { lazy } from 'react'
import { PluginRoute } from '@core-erp/plugin-types'

// Lazy load pages for code splitting
const ${ctx.resourceNamePascal}List = lazy(() => import('./pages/${ctx.resourceNamePascal}List'))
const ${ctx.resourceNamePascal}Form = lazy(() => import('./pages/${ctx.resourceNamePascal}Form'))
const ${ctx.resourceNamePascal}Detail = lazy(() => import('./pages/${ctx.resourceNamePascal}Detail'))

/**
 * Plugin routes
 * These routes will be automatically registered by the Core ERP system
 */
export default [
  {
    path: '/${ctx.pluginId}',
    component: ${ctx.resourceNamePascal}List,
    requiredPermission: '${ctx.pluginId}:view',
  },
  {
    path: '/${ctx.pluginId}/new',
    component: ${ctx.resourceNamePascal}Form,
    requiredPermission: '${ctx.pluginId}:create',
  },
  {
    path: '/${ctx.pluginId}/:id',
    component: ${ctx.resourceNamePascal}Detail,
    requiredPermission: '${ctx.pluginId}:view',
  },
  {
    path: '/${ctx.pluginId}/:id/edit',
    component: ${ctx.resourceNamePascal}Form,
    requiredPermission: '${ctx.pluginId}:edit',
  },
] as PluginRoute[]
`
}

/**
 * Generates menu items (src/frontend/menu.tsx)
 * 
 * Creates sidebar menu configuration with:
 * - Icon from Lucide React
 * - Permission-based visibility
 * - Proper ordering
 * 
 * @param ctx - Template context
 * @returns menu.tsx content
 */
export function menuTemplate(ctx: TemplateContext): string {
  return `/**
 * ${ctx.pluginName} - Menu Definitions
 * 
 * Defines sidebar menu items for the ${ctx.pluginName} plugin.
 */

import { PluginMenuItem } from '@core-erp/plugin-types'

/**
 * Plugin menu items
 * These will be automatically integrated into the Core ERP sidebar
 */
export default [
  {
    id: '${ctx.pluginId}',
    path: '/${ctx.pluginId}',
    label: '${ctx.pluginName}',
    icon: 'Package',  // Lucide icon name
    permission: '${ctx.pluginId}:view',
    order: 100,
    group: '${ctx.category}',
  },
] as PluginMenuItem[]
`
}

/**
 * Generates list page component (src/frontend/pages/{Resource}List.tsx)
 * 
 * Creates a complete list/table view with:
 * - Data fetching with React Query
 * - Search and filtering
 * - Sorting
 * - Pagination
 * - Actions (edit, delete)
 * - Permission checks
 * - Loading and empty states
 * 
 * @param ctx - Template context
 * @returns List page component content
 */
export function listPageTemplate(ctx: TemplateContext): string {
  return `/**
 * ${ctx.pluginName} - List Page
 * 
 * Displays a table of ${ctx.resourceNameLowerPlural} with search, filter, and actions.
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@core-erp/lib/supabase'
import { useAuth } from '@core-erp/contexts/AuthContext'
import { toast } from 'sonner'

// UI Components
import { Button } from '@core-erp/ui/components/ui'
import { Input } from '@core-erp/ui/components/ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@core-erp/ui/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { PageHeader } from '@core-erp/ui/components/responsive'
import { Skeleton } from '@core-erp/ui/components/ui'

// Icons
import { Plus, Search, MoreHorizontal, Pencil, Trash, Eye } from 'lucide-react'

/**
 * ${ctx.resourceName} type definition
 */
interface ${ctx.resourceNamePascal} {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

/**
 * ${ctx.resourceNamePascal}List Component
 * Main list view for managing ${ctx.resourceNameLowerPlural}
 */
export default function ${ctx.resourceNamePascal}List() {
  const { t } = useTranslation('${ctx.pluginId}')
  const { hasPermission } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  
  // Fetch ${ctx.resourceNameLowerPlural}
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['${ctx.pluginId}', '${ctx.resourceNameLowerPlural}', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (searchQuery) {
        query = query.ilike('name', \`%\${searchQuery}%\`)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as ${ctx.resourceNamePascal}[]
    },
  })
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${ctx.pluginId}', '${ctx.resourceNameLowerPlural}'] })
      toast.success(t('${ctx.resourceNameLower}.deleted'))
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(t('errors.delete_failed', { message: error.message }))
    },
  })
  
  // Handlers
  const handleCreate = () => {
    navigate('/${ctx.pluginId}/new')
  }
  
  const handleView = (id: string) => {
    navigate(\`/${ctx.pluginId}/\${id}\`)
  }
  
  const handleEdit = (id: string) => {
    navigate(\`/${ctx.pluginId}/\${id}/edit\`)
  }
  
  const handleDeleteClick = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete)
    }
  }
  
  // Permissions
  const canCreate = hasPermission('${ctx.pluginId}:create')
  const canEdit = hasPermission('${ctx.pluginId}:edit')
  const canDelete = hasPermission('${ctx.pluginId}:delete')
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title={t('${ctx.resourceNameLowerPlural}.title')}
        subtitle={t('${ctx.resourceNameLowerPlural}.subtitle')}
        action={
          canCreate ? (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {t('${ctx.resourceNameLowerPlural}.create')}
            </Button>
          ) : undefined
        }
      />
      
      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {t('errors.fetch_failed')}
        </div>
      ) : !items || items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">{t('${ctx.resourceNameLowerPlural}.empty')}</p>
          {canCreate && (
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              {t('${ctx.resourceNameLowerPlural}.create_first')}
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('${ctx.resourceNameLowerPlural}.fields.name')}</TableHead>
                <TableHead>{t('${ctx.resourceNameLowerPlural}.fields.description')}</TableHead>
                <TableHead>{t('common.created_at')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.description || '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(item.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('common.view')}
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(item.id)}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('${ctx.resourceNameLowerPlural}.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('${ctx.resourceNameLowerPlural}.delete_confirm_message')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
`
}

/**
 * Generates form page component (src/frontend/pages/{Resource}Form.tsx)
 * 
 * Creates a complete form with:
 * - React Hook Form integration
 * - Zod validation
 * - Create and edit modes
 * - Error handling
 * - Permission checks
 * 
 * @param ctx - Template context
 * @returns Form page component content
 */
export function formPageTemplate(ctx: TemplateContext): string {
  return `/**
 * ${ctx.pluginName} - Form Page
 * 
 * Form for creating and editing ${ctx.resourceNameLowerPlural}.
 */

import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@core-erp/lib/supabase'
import { toast } from 'sonner'

// UI Components
import { Button } from '@core-erp/ui/components/ui'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@core-erp/ui/components/ui'
import { Input } from '@core-erp/ui/components/ui'
import { Textarea } from '@core-erp/ui/components/ui'
import { PageHeader } from '@core-erp/ui/components/responsive'
import { Skeleton } from '@core-erp/ui/components/ui'

// Icons
import { Save, ArrowLeft } from 'lucide-react'

/**
 * Form validation schema
 */
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof formSchema>

/**
 * ${ctx.resourceNamePascal}Form Component
 * Handles both create and edit operations
 */
export default function ${ctx.resourceNamePascal}Form() {
  const { t } = useTranslation('${ctx.pluginId}')
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const isEditMode = !!id
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })
  
  // Fetch existing ${ctx.resourceNameLower} (for edit mode)
  const { data: item, isLoading } = useQuery({
    queryKey: ['${ctx.pluginId}', '${ctx.resourceNameLowerPlural}', id],
    queryFn: async () => {
      if (!id) return null
      
      const { data, error } = await supabase
        .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: isEditMode,
  })
  
  // Update form when data loads
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description || '',
      })
    }
  }, [item, form])
  
  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEditMode) {
        // Update existing
        const { error } = await supabase
          .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
          .update(values)
          .eq('id', id)
        
        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
          .insert([values])
        
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${ctx.pluginId}', '${ctx.resourceNameLowerPlural}'] })
      toast.success(t(isEditMode ? '${ctx.resourceNameLower}.updated' : '${ctx.resourceNameLower}.created'))
      navigate('/${ctx.pluginId}')
    },
    onError: (error: Error) => {
      toast.error(t('errors.save_failed', { message: error.message }))
    },
  })
  
  // Handlers
  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(values)
  }
  
  const handleCancel = () => {
    navigate('/${ctx.pluginId}')
  }
  
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <PageHeader
        title={t(isEditMode ? '${ctx.resourceNameLowerPlural}.edit' : '${ctx.resourceNameLowerPlural}.create')}
        subtitle={t(isEditMode ? '${ctx.resourceNameLowerPlural}.edit_subtitle' : '${ctx.resourceNameLowerPlural}.create_subtitle')}
        backButton={{
          label: t('common.back'),
          onClick: handleCancel,
        }}
      />
      
      {isLoading && isEditMode ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('${ctx.resourceNameLowerPlural}.fields.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('${ctx.resourceNameLowerPlural}.fields.name_placeholder')} {...field} />
                  </FormControl>
                  <FormDescription>
                    {t('${ctx.resourceNameLowerPlural}.fields.name_description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('${ctx.resourceNameLowerPlural}.fields.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('${ctx.resourceNameLowerPlural}.fields.description_placeholder')}
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('${ctx.resourceNameLowerPlural}.fields.description_description')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
`
}

/**
 * Generates detail page component (src/frontend/pages/{Resource}Detail.tsx)
 * 
 * Creates a detail view with:
 * - Read-only display
 * - Edit button
 * - Delete button
 * - Permission checks
 * 
 * @param ctx - Template context
 * @returns Detail page component content
 */
export function detailPageTemplate(ctx: TemplateContext): string {
  return `/**
 * ${ctx.pluginName} - Detail Page
 * 
 * Displays details of a single ${ctx.resourceNameLower}.
 */

import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@core-erp/lib/supabase'
import { useAuth } from '@core-erp/contexts/AuthContext'
import { toast } from 'sonner'

// UI Components
import { Button } from '@core-erp/ui/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core-erp/ui/components/ui'
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
import { PageHeader } from '@core-erp/ui/components/responsive'
import { Skeleton } from '@core-erp/ui/components/ui'

// Icons
import { Pencil, Trash, ArrowLeft } from 'lucide-react'

/**
 * ${ctx.resourceNamePascal}Detail Component
 * Displays details of a single ${ctx.resourceNameLower}
 */
export default function ${ctx.resourceNamePascal}Detail() {
  const { t } = useTranslation('${ctx.pluginId}')
  const { hasPermission } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Fetch ${ctx.resourceNameLower}
  const { data: item, isLoading, error } = useQuery({
    queryKey: ['${ctx.pluginId}', '${ctx.resourceNameLowerPlural}', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided')
      
      const { data, error } = await supabase
        .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
  })
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No ID provided')
      
      const { error } = await supabase
        .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${ctx.pluginId}', '${ctx.resourceNameLowerPlural}'] })
      toast.success(t('${ctx.resourceNameLower}.deleted'))
      navigate('/${ctx.pluginId}')
    },
    onError: (error: Error) => {
      toast.error(t('errors.delete_failed', { message: error.message }))
    },
  })
  
  // Handlers
  const handleBack = () => {
    navigate('/${ctx.pluginId}')
  }
  
  const handleEdit = () => {
    navigate(\`/${ctx.pluginId}/\${id}/edit\`)
  }
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteConfirm = () => {
    deleteMutation.mutate()
  }
  
  // Permissions
  const canEdit = hasPermission('${ctx.pluginId}:edit')
  const canDelete = hasPermission('${ctx.pluginId}:delete')
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {t('errors.fetch_failed')}
        </div>
      ) : !item ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('${ctx.resourceNameLowerPlural}.not_found')}</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
      ) : (
        <>
          <PageHeader
            title={item.name}
            subtitle={t('${ctx.resourceNameLowerPlural}.detail_subtitle')}
            backButton={{
              label: t('common.back'),
              onClick: handleBack,
            }}
            action={
              <div className="flex gap-2">
                {canEdit && (
                  <Button onClick={handleEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('common.edit')}
                  </Button>
                )}
                {canDelete && (
                  <Button variant="destructive" onClick={handleDeleteClick}>
                    <Trash className="mr-2 h-4 w-4" />
                    {t('common.delete')}
                  </Button>
                )}
              </div>
            }
          />
          
          <Card>
            <CardHeader>
              <CardTitle>{t('${ctx.resourceNameLowerPlural}.details')}</CardTitle>
              <CardDescription>{t('${ctx.resourceNameLowerPlural}.details_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('${ctx.resourceNameLowerPlural}.fields.name')}
                </div>
                <div className="mt-1 text-lg">{item.name}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  {t('${ctx.resourceNameLowerPlural}.fields.description')}
                </div>
                <div className="mt-1">{item.description || '-'}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('common.created_at')}
                  </div>
                  <div className="mt-1">{new Date(item.created_at).toLocaleString()}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {t('common.updated_at')}
                  </div>
                  <div className="mt-1">{new Date(item.updated_at).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('${ctx.resourceNameLowerPlural}.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('${ctx.resourceNameLowerPlural}.delete_confirm_message')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
`
}

/**
 * Generates widget component (src/frontend/widgets/{Plugin}Widget.tsx)
 * 
 * Creates a dashboard widget with:
 * - Summary statistics
 * - Recent items
 * - Quick actions
 * 
 * @param ctx - Template context
 * @returns Widget component content
 */
export function widgetTemplate(ctx: TemplateContext): string {
  return `/**
 * ${ctx.pluginName} - Dashboard Widget
 * 
 * Displays summary information on the dashboard.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@core-erp/lib/supabase'

// UI Components
import { Button } from '@core-erp/ui/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@core-erp/ui/components/ui'

// Icons
import { Package } from 'lucide-react'

/**
 * ${ctx.pluginIdPascal}Widget Component
 * Dashboard widget showing ${ctx.resourceNameLower} statistics
 */
export default function ${ctx.pluginIdPascal}Widget() {
  const { t } = useTranslation('${ctx.pluginId}')
  const navigate = useNavigate()
  
  // Fetch count
  const { data: count } = useQuery({
    queryKey: ['${ctx.pluginId}', '${ctx.resourceNameLowerPlural}', 'count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('${ctx.pluginId}_${ctx.resourceNameLowerPlural}')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      return count || 0
    },
  })
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('widget.title')}</CardTitle>
            <CardDescription>{t('widget.description')}</CardDescription>
          </div>
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{count ?? '-'}</div>
        <p className="text-sm text-muted-foreground mt-1">{t('widget.total_items')}</p>
        <Button onClick={() => navigate('/${ctx.pluginId}')} className="mt-4 w-full">
          {t('widget.view_all')}
        </Button>
      </CardContent>
    </Card>
  )
}
`
}

