import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type {
  PermissionCatalogContext,
  PermissionModuleGroup,
} from '../../types/tenant-access-control.types'
import {
  createPersonalPermissionRow,
  createRolePermissionRow,
} from '../../utils/tenant-access-control'
import { PermissionRow } from './PermissionRow'

interface PermissionModuleSectionProps {
  readonly group: PermissionModuleGroup
  readonly context: PermissionCatalogContext
  readonly disabled?: boolean
  readonly onTogglePermission: (permissionId: string) => void
  readonly onToggleModule: (permissionIds: string[]) => void
}

export function PermissionModuleSection({
  group,
  context,
  disabled,
  onTogglePermission,
  onToggleModule,
}: PermissionModuleSectionProps) {
  const rows = group.permissions.map((permission) =>
    context.kind === 'role'
      ? createRolePermissionRow(
          permission,
          context.roleName,
          context.selectedIds,
          context.inheritedIds
        )
      : createPersonalPermissionRow(
          permission,
          context.roleName,
          context.selectedIds,
          context.roleDefaultIds
        )
  )
  const editableRows = rows.filter((row) => row.editable)
  const selectedEditableCount = editableRows.filter((row) => row.checked).length
  const allSelected = editableRows.length > 0 && selectedEditableCount === editableRows.length
  const someSelected = selectedEditableCount > 0 && !allSelected
  const effectiveCount = rows.filter((row) => row.checked).length

  return (
    <AccordionItem value={group.module} className="border-border border-b last:border-b-0">
      <div className="flex min-h-14 min-w-0 items-center gap-3 px-3 sm:px-4">
        <Checkbox
          aria-label={`Chọn tất cả ${context.kind === 'role' ? 'quyền trực tiếp' : 'quyền'} trong ${group.moduleDisplayName}`}
          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
          disabled={disabled || editableRows.length === 0}
          onCheckedChange={() => onToggleModule(editableRows.map((row) => row.permission.id))}
        />
        <AccordionTrigger className="min-w-0 flex-1 py-3 hover:no-underline">
          <span className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-2">
            <span className="text-foreground min-w-0 truncate text-sm font-semibold">
              {group.moduleDisplayName}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-muted-foreground hidden text-[11px] sm:inline">
                {selectedEditableCount}{' '}
                {context.kind === 'role' ? 'quyền trực tiếp' : 'quyền đã chọn'}
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
          {rows.map((row) => (
            <PermissionRow
              key={row.permission.id}
              model={row}
              subjectId={context.subjectId}
              disabled={disabled}
              onToggle={onTogglePermission}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
