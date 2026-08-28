import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { PermissionModuleGroup } from '../../types/tenant-access-control.types'
import { PermissionRow } from './PermissionRow'

interface PermissionModuleSectionProps {
  group: PermissionModuleGroup
  roleId: string
  roleName: string
  selectedIds: ReadonlySet<string>
  inheritedIds: ReadonlySet<string>
  disabled?: boolean
  onTogglePermission: (permissionId: string) => void
  onToggleModule: (permissionIds: string[]) => void
}

export function PermissionModuleSection({
  group,
  roleId,
  roleName,
  selectedIds,
  inheritedIds,
  disabled,
  onTogglePermission,
  onToggleModule,
}: PermissionModuleSectionProps) {
  const editablePermissions = group.permissions.filter(
    (permission) => permission.eligibleRoles.includes(roleName) && !inheritedIds.has(permission.id)
  )
  const selectedEditableCount = editablePermissions.filter((permission) =>
    selectedIds.has(permission.id)
  ).length
  const allSelected =
    editablePermissions.length > 0 && selectedEditableCount === editablePermissions.length
  const someSelected = selectedEditableCount > 0 && !allSelected
  const effectiveCount = group.permissions.filter(
    (permission) => selectedIds.has(permission.id) || inheritedIds.has(permission.id)
  ).length

  return (
    <AccordionItem value={group.module} className="border-border border-b last:border-b-0">
      <div className="flex min-w-0 items-center gap-3 px-3 sm:px-4">
        <Checkbox
          aria-label={`Chọn tất cả quyền trực tiếp trong ${group.moduleDisplayName}`}
          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
          disabled={disabled || editablePermissions.length === 0}
          onCheckedChange={() =>
            onToggleModule(editablePermissions.map((permission) => permission.id))
          }
        />
        <AccordionTrigger className="min-w-0 flex-1 py-3.5 hover:no-underline">
          <span className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-2">
            <span className="text-foreground min-w-0 truncate text-sm font-semibold">
              {group.moduleDisplayName}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-muted-foreground hidden text-[11px] sm:inline">
                {selectedEditableCount} quyền trực tiếp
              </span>
              <Badge
                variant={effectiveCount > 0 ? 'secondary' : 'outline'}
                className="tabular-nums"
              >
                {effectiveCount}/{group.permissions.length} hiệu lực
              </Badge>
            </span>
          </span>
        </AccordionTrigger>
      </div>
      <AccordionContent className="bg-muted/20 border-border border-t px-3 py-3 sm:px-4">
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
          {group.permissions.map((permission) => (
            <PermissionRow
              key={permission.id}
              permission={permission}
              roleId={roleId}
              roleName={roleName}
              selected={selectedIds.has(permission.id)}
              inherited={inheritedIds.has(permission.id)}
              disabled={disabled}
              onToggle={onTogglePermission}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
