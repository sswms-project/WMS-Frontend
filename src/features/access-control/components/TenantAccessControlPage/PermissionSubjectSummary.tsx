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
  const warehouseCodes = subject.warehouses.map((warehouse) => warehouse.code).join(', ')

  return (
    <div className="border-border bg-muted/20 flex min-w-0 flex-col gap-2 border-b px-3 py-2.5 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
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
      <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs lg:justify-end">
        {subject.warehouses.length ? (
          <span className="min-w-0 truncate" title={warehouseCodes}>
            {subject.warehouses.length} kho · {warehouseCodes}
          </span>
        ) : (
          <span>Chưa được gán kho</span>
        )}
      </div>
    </div>
  )
}
