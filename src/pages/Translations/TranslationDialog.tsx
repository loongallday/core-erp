import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  useTranslation as useTranslationData,
  useCreateTranslation,
  useUpdateTranslation,
} from '@/hooks/useTranslations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@core-erp/ui/components/ui'
import { Button } from '@core-erp/ui/components/ui'
import { Input } from '@core-erp/ui/components/ui'
import { Textarea } from '@core-erp/ui/components/ui'
import { Label } from '@core-erp/ui/components/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@core-erp/ui/components/ui'

const translationSchema = z.object({
  locale: z.enum(['en', 'th'], {
    required_error: 'Please select a locale',
  }),
  namespace: z.enum(['common', 'auth', 'users', 'roles', 'errors'], {
    required_error: 'Please select a namespace',
  }),
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
})

type TranslationFormData = z.infer<typeof translationSchema>

interface TranslationDialogProps {
  translationId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TranslationDialog({
  translationId,
  open,
  onOpenChange,
}: TranslationDialogProps) {
  const isEditing = !!translationId
  const { data: existingTranslation } = useTranslationData(translationId || '')
  const createTranslation = useCreateTranslation()
  const updateTranslation = useUpdateTranslation()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TranslationFormData>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      locale: 'en',
      namespace: 'common',
      key: '',
      value: '',
    },
  })

  const selectedLocale = watch('locale')
  const selectedNamespace = watch('namespace')

  // Load existing translation data
  useEffect(() => {
    if (existingTranslation) {
      reset({
        locale: existingTranslation.locale as 'en' | 'th',
        namespace: existingTranslation.namespace as any,
        key: existingTranslation.key,
        value: existingTranslation.value,
      })
    } else if (!isEditing) {
      reset({
        locale: 'en',
        namespace: 'common',
        key: '',
        value: '',
      })
    }
  }, [existingTranslation, isEditing, reset])

  const onSubmit = async (data: TranslationFormData) => {
    try {
      if (isEditing && translationId) {
        await updateTranslation.mutateAsync({
          id: translationId,
          ...data,
        })
      } else {
        await createTranslation.mutateAsync(data)
      }
      onOpenChange(false)
      reset()
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Translation' : 'Add New Translation'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the translation value or key.'
              : 'Create a new translation for a specific locale and namespace.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locale">Locale *</Label>
              <Select
                value={selectedLocale}
                onValueChange={(value) => setValue('locale', value as 'en' | 'th')}
                disabled={isEditing}
              >
                <SelectTrigger id="locale">
                  <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English (en)</SelectItem>
                  <SelectItem value="th">🇹🇭 ไทย (th)</SelectItem>
                </SelectContent>
              </Select>
              {errors.locale && (
                <p className="text-sm text-destructive">{errors.locale.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="namespace">Namespace *</Label>
              <Select
                value={selectedNamespace}
                onValueChange={(value) => setValue('namespace', value as any)}
                disabled={isEditing}
              >
                <SelectTrigger id="namespace">
                  <SelectValue placeholder="Select namespace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">common</SelectItem>
                  <SelectItem value="auth">auth</SelectItem>
                  <SelectItem value="users">users</SelectItem>
                  <SelectItem value="roles">roles</SelectItem>
                  <SelectItem value="errors">errors</SelectItem>
                </SelectContent>
              </Select>
              {errors.namespace && (
                <p className="text-sm text-destructive">{errors.namespace.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">
              Translation Key *
              <span className="text-xs text-muted-foreground ml-2">
                (Use dot notation: e.g., actions.save)
              </span>
            </Label>
            <Input
              id="key"
              placeholder="e.g., actions.save or login.title"
              {...register('key')}
              disabled={isEditing}
            />
            {errors.key && (
              <p className="text-sm text-destructive">{errors.key.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Translation Value *</Label>
            <Textarea
              id="value"
              placeholder="Enter the translated text"
              rows={4}
              {...register('value')}
            />
            {errors.value && (
              <p className="text-sm text-destructive">{errors.value.message}</p>
            )}
          </div>

          {isEditing && (
            <div className="bg-muted p-3 rounded text-sm">
              <p className="text-muted-foreground">
                <strong>Note:</strong> Locale, namespace, and key cannot be changed when editing.
                If you need to change these, please create a new translation.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

