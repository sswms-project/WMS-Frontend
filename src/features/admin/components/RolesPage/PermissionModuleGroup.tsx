import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import type { PermissionResponse } from '../../types/admin.types'

interface PermissionModuleGroupProps {
  readonly moduleName: string
  readonly permissions: PermissionResponse[]
  readonly selected: ReadonlySet<string>
  readonly isOpen: boolean
  readonly onToggle: () => void
  readonly onToggleOpen: () => void
  readonly onTogglePermission: (permissionId: string) => void
}

export function PermissionModuleGroup({
  moduleName,
  permissions,
  selected,
  isOpen,
  onToggle,
  onToggleOpen,
  onTogglePermission,
}: PermissionModuleGroupProps) {
  const selectedCount = permissions.filter((permission) => selected.has(permission.id)).length
  const allSelected = selectedCount === permissions.length

  return (
    <section>
      <div className="bg-muted/30 flex items-center gap-2 border-b px-4 py-2.5">
        <Checkbox
          checked={allSelected ? true : selectedCount > 0 ? 'indeterminate' : false}
          onCheckedChange={onToggle}
          aria-label={`Chọn tất cả quyền thuộc ${moduleName}`}
        />
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <ChevronDown className="size-3.5 shrink-0" />
          ) : (
            <ChevronRight className="size-3.5 shrink-0" />
          )}
          <span className="truncate text-xs font-semibold">{moduleName}</span>
        </button>
        <Badge variant="outline" className="text-[10px] tabular-nums">
          {selectedCount}/{permissions.length}
        </Badge>
      </div>
      {isOpen && (
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {permissions.map((permission) => (
            <label
              key={permission.id}
              className="hover:bg-muted/30 border-border/70 flex cursor-pointer items-start gap-3 border-b px-4 py-2.5 lg:odd:border-r"
            >
              <Checkbox
                checked={selected.has(permission.id)}
                onCheckedChange={() => onTogglePermission(permission.id)}
                className="mt-0.5 shrink-0"
              />
              <span className="min-w-0">
                <span className="text-foreground block text-sm font-medium">
                  {permission.displayName || 'Quyền chưa có tên hiển thị'}
                </span>
                <span className="text-muted-foreground mt-0.5 block font-mono text-[10px]">
                  {permission.permissionKey}
                </span>
                {permission.description && (
                  <span className="text-muted-foreground mt-1 block text-xs leading-5">
                    {permission.description}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
      )}
      <Separator />
    </section>
  )
}
