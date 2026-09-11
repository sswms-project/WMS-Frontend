import { Badge } from '@/components/ui/badge'
import type { TenantUserPermissionWorkspace } from '../../types/tenant-access-control.types'
import { getTenantRoleContent } from '../../utils/tenant-access-control'

interface PermissionSubjectSummaryProps {
  readonly workspace: TenantUserPermissionWorkspace
  readonly customizedCount: number
}

export function PermissionSubjectSummary({
  workspace,
  customizedCount,
}: PermissionSubjectSummaryProps) {
  const { subject } = workspace
  const visibleWarehouses = subject.warehouses.slice(0, 3)
  const hiddenWarehouseCount = subject.warehouses.length - visibleWarehouses.length

  return (
    <div className="border-border bg-muted/20 flex min-w-0 flex-col gap-3 border-b px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="text-foreground truncate text-base font-semibold">{subject.fullName}</h2>
          <Badge variant="outline">{getTenantRoleContent(subject.roleName).label}</Badge>
          {customizedCount > 0 && (
            <Badge variant="secondary">{customizedCount} quyền tùy chỉnh</Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1 truncate text-xs">{subject.email}</p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:justify-end">
        {visibleWarehouses.length ? (
          <>
            {visibleWarehouses.map((warehouse) => (
              <Badge key={warehouse.id} variant="outline" className="max-w-48 truncate">
                {warehouse.code} · {warehouse.name}
              </Badge>
            ))}
            {hiddenWarehouseCount > 0 && (
              <Badge variant="outline">+{hiddenWarehouseCount} kho</Badge>
            )}
          </>
        ) : (
          <span className="text-muted-foreground text-xs">Chưa được gán kho</span>
        )}
      </div>
    </div>
  )
}
