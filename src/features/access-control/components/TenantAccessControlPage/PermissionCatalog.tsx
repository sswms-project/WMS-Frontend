import { SearchX } from 'lucide-react'
import { Accordion } from '@/components/ui/accordion'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type { PermissionModuleGroup } from '../../types/tenant-access-control.types'
import { PermissionModuleSection } from './PermissionModuleSection'

interface PermissionCatalogProps {
  readonly groups: PermissionModuleGroup[]
  readonly roleId: string
  readonly roleName: string
  readonly selectedIds: ReadonlySet<string>
  readonly inheritedIds: ReadonlySet<string>
  readonly openModules: string[]
  readonly disabled?: boolean
  readonly hasSearch: boolean
  readonly onOpenModulesChange: (modules: string[]) => void
  readonly onTogglePermission: (permissionId: string) => void
  readonly onToggleModule: (permissionIds: string[]) => void
}

export function PermissionCatalog({
  groups,
  roleId,
  roleName,
  selectedIds,
  inheritedIds,
  openModules,
  disabled,
  hasSearch,
  onOpenModulesChange,
  onTogglePermission,
  onToggleModule,
}: PermissionCatalogProps) {
  if (groups.length === 0) {
    return (
      <Empty className="h-full min-h-64">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            {hasSearch ? 'Không tìm thấy quyền phù hợp' : 'Chưa có quyền để cấu hình'}
          </EmptyTitle>
          <EmptyDescription>
            {hasSearch
              ? 'Thử từ khóa khác theo tên quyền, mô tả hoặc phân hệ.'
              : 'Backend chưa cung cấp quyền vận hành có thể ủy quyền cho tenant.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Accordion
      type="multiple"
      value={openModules}
      onValueChange={onOpenModulesChange}
      className="border-border bg-card overflow-hidden rounded-md border"
    >
      {groups.map((group) => (
        <PermissionModuleSection
          key={group.module}
          group={group}
          roleId={roleId}
          roleName={roleName}
          selectedIds={selectedIds}
          inheritedIds={inheritedIds}
          disabled={disabled}
          onTogglePermission={onTogglePermission}
          onToggleModule={onToggleModule}
        />
      ))}
    </Accordion>
  )
}
