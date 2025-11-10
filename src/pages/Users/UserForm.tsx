import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreateUser, useUpdateUser, useUser, useRoles, useAuth } from '@core-erp/entity'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@core-erp/ui/components/ui'
import { Input } from '@core-erp/ui/components/ui'
import { Label } from '@core-erp/ui/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@core-erp/ui/components/ui'
import { Checkbox } from '@core-erp/ui/components/ui'
import { Switch } from '@core-erp/ui/components/ui'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

const userFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role_ids: z.array(z.string()).min(1, 'Select at least one role'),
  is_active: z.boolean().default(true),
})

type UserFormValues = z.infer<typeof userFormSchema>

export default function UserForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const isEditing = !!id

  const { data: user, isLoading: userLoading } = useUser(id || '')
  const { data: roles = [], isLoading: rolesLoading } = useRoles()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role_ids: [],
      is_active: true,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (user && isEditing) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role_ids: user.roles?.map((ur: any) => ur.role.id) || [],
        is_active: user.is_active,
      })
    }
  }, [user, isEditing, form])

  const onSubmit = async (data: UserFormValues) => {
    try {
      if (isEditing) {
        await updateUser.mutateAsync({
          id: id!,
          ...data,
        })
        toast.success('User updated successfully')
      } else {
        await createUser.mutateAsync(data)
        toast.success('User created successfully')
      }
      navigate('/users')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    }
  }

  if (!hasPermission(isEditing ? 'users:edit' : 'users:create')) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-sm md:text-base text-muted-foreground">You don't have permission to {isEditing ? 'edit' : 'create'} users</p>
        </div>
      </AppLayout>
    )
  }

  if (userLoading || rolesLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div>Loading...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div>
        <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center gap-3 md:gap-4">
              <Button variant="ghost" size="icon" className="touch-target" onClick={() => navigate('/users')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold truncate">{isEditing ? 'Edit User' : 'Create User'}</h1>
                <p className="text-sm text-muted-foreground truncate">
                  {isEditing ? 'Update user information' : 'Add a new user to the system'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <Card className="max-w-full md:max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="John Doe"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="john@example.com"
                    disabled={isEditing}
                  />
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">Email cannot be changed after creation</p>
                  )}
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register('phone')}
                    placeholder="+1234567890"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                {/* Roles */}
                <div className="space-y-3">
                  <Label>Roles *</Label>
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2 touch-target min-h-[44px]">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={form.watch('role_ids').includes(role.id)}
                          onCheckedChange={(checked) => {
                            const currentRoles = form.getValues('role_ids')
                            if (checked) {
                              form.setValue('role_ids', [...currentRoles, role.id])
                            } else {
                              form.setValue('role_ids', currentRoles.filter(id => id !== role.id))
                            }
                          }}
                          className="w-5 h-5"
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {role.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            (Level {role.level})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.role_ids && (
                    <p className="text-sm text-destructive">{form.formState.errors.role_ids.message}</p>
                  )}
                </div>

                {/* Active Status */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor="is_active">Active Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Inactive users cannot log in to the system
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={form.watch('is_active')}
                      onCheckedChange={(checked) => form.setValue('is_active', checked)}
                      className="touch-target"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={createUser.isPending || updateUser.isPending}
                    className="w-full sm:w-auto touch-target"
                  >
                    {createUser.isPending || updateUser.isPending
                      ? 'Saving...'
                      : isEditing
                      ? 'Update User'
                      : 'Create User'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/users')}
                    className="w-full sm:w-auto touch-target"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

