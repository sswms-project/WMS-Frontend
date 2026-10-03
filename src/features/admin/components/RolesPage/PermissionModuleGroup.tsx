import { LockKeyhole } from 'lucide-react'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { AdminPermissionModuleGroup } from '../../types/admin.types'

interface PermissionModuleGroupBaseProps {
  readonly group: AdminPermissionModuleGroup
  readonly completeGroup: AdminPermissionModuleGroup
}

interface ReadOnlyPermissionModuleGroupProps extends PermissionModuleGroupBaseProps {
  readonly mode: 'readOnly'
}

interface EditablePermissionModuleGroupProps extends PermissionModuleGroupBaseProps {
  readonly mode: 'editable'
  readonly selectedIds: ReadonlySet<string>
  readonly disabled?: boolean
  readonly onTogglePermission: (permissionId: string) => void
  readonly onToggleModule: (permissionIds: string[]) => void
}

type PermissionModuleGroupProps =
  | ReadOnlyPermissionModuleGroupProps
  | EditablePermissionModuleGroupProps

function PlatformOnlyBadge() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="shrink-0" tabIndex={0}>
          <LockKeyhole aria-hidden="true" />
          Chỉ Quản trị hệ thống
        </Badge>
      </TooltipTrigger>
      <TooltipContent sideOffset={4}>
        Quyền này chỉ áp dụng cho hoạt động quản trị nền tảng.
      </TooltipContent>
    </Tooltip>
  )
}

export function PermissionModuleGroup(props: PermissionModuleGroupProps) {
  const { group, completeGroup } = props
  const selectedCount =
    props.mode === 'editable'
      ? completeGroup.permissions.filter((permission) => props.selectedIds.has(permission.id))
          .length
      : 0
  const allSelected =
    props.mode === 'editable' &&
    completeGroup.permissions.length > 0 &&
    selectedCount === completeGroup.permissions.length
  const someSelected = props.mode === 'editable' && selectedCount > 0 && !allSelected

  return (
    <AccordionItem value={group.module} className="border-border border-b last:border-b-0">
      <div className="flex min-h-14 min-w-0 items-center gap-3 px-3 sm:px-4">
        {props.mode === 'editable' ? (
          <Checkbox
            aria-label={`Chọn tất cả quyền trong ${group.moduleDisplayName}`}
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            disabled={props.disabled}
            onCheckedChange={() =>
              props.onToggleModule(completeGroup.permissions.map((permission) => permission.id))
            }
          />
        ) : null}
        <AccordionTrigger className="min-w-0 flex-1 py-3 hover:no-underline">
          <span className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-2">
            <span className="text-foreground min-w-0 text-left text-sm font-semibold break-words whitespace-normal">
              {group.moduleDisplayName}
            </span>
            <Badge
              variant={props.mode === 'editable' && selectedCount > 0 ? 'secondary' : 'outline'}
              className="shrink-0 tabular-nums"
            >
              {props.mode === 'editable'
                ? `${selectedCount}/${completeGroup.permissions.length}`
                : `${completeGroup.permissions.length} quyền`}
            </Badge>
          </span>
        </AccordionTrigger>
      </div>
      <AccordionContent className="bg-muted/20 border-border border-t px-3 py-3 sm:px-4">
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
          {group.permissions.map((permission) => {
            const content = (
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="text-foreground text-sm font-medium break-words">
                    {permission.displayName || 'Quyền chưa có tên hiển thị'}
                  </span>
                  {permission.scope === 'PlatformOnly' ? <PlatformOnlyBadge /> : null}
                </span>
                <span
                  className="text-muted-foreground mt-0.5 block font-mono text-[10px] break-all"
                  translate="no"
                >
                  {permission.permissionKey}
                </span>
                {permission.description ? (
                  <span className="text-muted-foreground mt-1 block text-xs leading-5">
                    {permission.description}
                  </span>
                ) : null}
              </span>
            )

            return props.mode === 'editable' ? (
              <label
                key={permission.id}
                className="border-border bg-card hover:bg-muted/30 flex cursor-pointer items-start gap-3 rounded-md border p-3"
              >
                <Checkbox
                  checked={props.selectedIds.has(permission.id)}
                  disabled={props.disabled}
                  onCheckedChange={() => props.onTogglePermission(permission.id)}
                  aria-label={permission.displayName || permission.permissionKey}
                  className="mt-0.5 shrink-0"
                />
                {content}
              </label>
            ) : (
              <div
                key={permission.id}
                className="border-border bg-card flex min-w-0 items-start rounded-md border p-3"
              >
                {content}
              </div>
            )
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
