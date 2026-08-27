import { LockKeyhole } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import type { TenantAssignablePermission } from '../../types/tenant-access-control.types'

interface PermissionRowProps {
  permission: TenantAssignablePermission
  roleId: string
  roleName: string
  selected: boolean
  inherited: boolean
  disabled?: boolean
  onToggle: (permissionId: string) => void
}

export function PermissionRow({
  permission,
  roleId,
  roleName,
  selected,
  inherited,
  disabled,
  onToggle,
}: PermissionRowProps) {
  const eligible = permission.eligibleRoles.includes(roleName)
  const locked = inherited || !eligible
  const inputId = `permission-${roleId}-${permission.id}`
  const descriptionId = `${inputId}-description`

  return (
    <Field
      orientation="horizontal"
      data-disabled={locked || disabled ? 'true' : undefined}
      className={cn(
        'border-border bg-background items-start rounded-md border px-3 py-3 transition-colors',
        selected && !inherited && 'border-primary/30 bg-primary/5',
        inherited && 'bg-muted/70',
        !eligible && 'bg-muted/30 opacity-70'
      )}
    >
      <Checkbox
        id={inputId}
        aria-describedby={descriptionId}
        checked={selected || inherited}
        disabled={locked || disabled}
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
          {!eligible && <Badge variant="outline">Không áp dụng</Badge>}
        </div>
        <FieldDescription id={descriptionId} className="leading-5 break-words">
          {permission.description}
        </FieldDescription>
        <code className="text-muted-foreground block max-w-full truncate text-[11px]">
          {permission.permissionKey}
        </code>
      </FieldContent>
    </Field>
  )
}
