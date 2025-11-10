import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRole } from '@/hooks/useRoles'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@core-erp/ui/components/ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@core-erp/ui/components/ui'
import { Checkbox } from '@core-erp/ui/components/ui'
import { Badge } from '@core-erp/ui/components/ui'
import { Separator } from '@core-erp/ui/components/ui'
import { toast } from 'sonner'
import { ArrowLeft, Shield, Save } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

export default function RoleDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const queryClient = useQueryClient()

  const { data: role, isLoading: roleLoading } = useRole(id || '')
  const { data: allPermissions = [], isLoading: permissionsLoading } = usePermissions()

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Initialize selected permissions when role loads
  useState(() => {
    if (role?.permissions) {
      const permissionIds = role.permissions.map((rp: any) => rp.permission.id)
      setSelectedPermissions(permissionIds)
    }
  })

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleToggleCategory = (category: string) => {
    const categoryPermissions = allPermissions
      .filter(p => p.category === category)
      .map(p => p.id)
    
    const allSelected = categoryPermissions.every(id => selectedPermissions.includes(id))
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !categoryPermissions.includes(id)))
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryPermissions])])
    }
  }

  const handleSave = async () => {
    if (!role) return

    try {
      setIsSaving(true)

      // Delete all existing permissions for this role
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', role.id)

      if (deleteError) throw deleteError

      // Insert new permissions
      if (selectedPermissions.length > 0) {
        const inserts = selectedPermissions.map(permission_id => ({
          role_id: role.id,
          permission_id,
        }))

        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(inserts)

        if (insertError) throw insertError
      }

      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['roles', id] })
      toast.success('Permissions updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update permissions')
    } finally {
      setIsSaving(false)
    }
  }

  if (!hasPermission('permissions:assign')) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to manage role permissions</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (roleLoading || permissionsLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </AppLayout>
    )
  }

  if (!role) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Role Not Found</h1>
            <Button onClick={() => navigate('/roles')}>Back to Roles</Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    const category = permission.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(permission)
    return acc
  }, {} as Record<string, typeof allPermissions>)

  return (
    <AppLayout>
      <div>
        <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/roles')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    <h1 className="text-3xl font-bold">{role.name}</h1>
                    {role.is_system && <Badge variant="secondary">System</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Role Info */}
            <Card>
              <CardHeader>
                <CardTitle>Role Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="font-mono text-sm">{role.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="font-medium">{role.level}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={role.is_active ? 'default' : 'secondary'}>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Permissions Assigned</p>
                  <p className="font-medium">{selectedPermissions.length} of {allPermissions.length}</p>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>
                  Select the permissions this role should have
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                  const categoryPermissionIds = permissions.map(p => p.id)
                  const allCategorySelected = categoryPermissionIds.every(id =>
                    selectedPermissions.includes(id)
                  )
                  // Can be used for indeterminate checkbox state in future
                  // const someCategorySelected = categoryPermissionIds.some(id =>
                  //   selectedPermissions.includes(id)
                  // )

                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold capitalize">{category}</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleCategory(category)}
                        >
                          {allCategorySelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      
                      <div className="space-y-2 pl-4">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={permission.id}
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                {permission.name}
                              </label>
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono mt-1">
                                {permission.code}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {Object.keys(permissionsByCategory).indexOf(category) < Object.keys(permissionsByCategory).length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

