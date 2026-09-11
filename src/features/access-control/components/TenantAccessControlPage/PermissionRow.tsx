import { LockKeyhole } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import type { PermissionRowViewModel } from '../../types/tenant-access-control.types'

interface PermissionRowProps {
  readonly model: PermissionRowViewModel
  readonly subjectId: string
  readonly disabled?: boolean
  readonly onToggle: (permissionId: string) => void
}

export function PermissionRow({ model, subjectId, disabled, onToggle }: PermissionRowProps) {
  const { permission, checked, editable, presentation } = model
  const inherited = presentation === 'role-inherited'
  const customized = presentation === 'personal-customized'
  const unavailable = presentation === 'role-unavailable' || presentation === 'personal-unavailable'
  const inputId = `permission-${subjectId}-${permission.id}`
  const descriptionId = `${inputId}-description`

  return (
    <Field
      orientation="horizontal"
      data-disabled={!editable || disabled ? 'true' : undefined}
      className={cn(
        'border-border bg-background items-start rounded-md border px-3 py-3 transition-colors',
        checked && !inherited && 'border-primary/30 bg-primary/5',
        inherited && 'bg-muted/70',
        unavailable && 'bg-muted/30 opacity-70'
      )}
    >
      <Checkbox
        id={inputId}
        aria-describedby={descriptionId}
        checked={checked}
        disabled={!editable || disabled}
        onCheckedChange={() => onToggle(permission.id)}
        className="mt-0.5"
      />
      <FieldContent className="min-w-0 gap-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <FieldLabel htmlFor={inputId} className="min-w-0 cursor-pointer text-xs font-medium">
            {permission.displayName}
          </FieldLabel>
          {inherited && (
            <Badge variant="secondary" className="gap-1">
              <LockKeyhole aria-hidden="true" />
              Kế thừa từ Nhân viên kho
            </Badge>
          )}
          {customized && <Badge variant="secondary">Tùy chỉnh</Badge>}
          {unavailable && <Badge variant="outline">Không áp dụng</Badge>}
        </div>
        <FieldDescription id={descriptionId} className="leading-5 break-words">
          {permission.description}
        </FieldDescription>
      </FieldContent>
    </Field>
  )
}
