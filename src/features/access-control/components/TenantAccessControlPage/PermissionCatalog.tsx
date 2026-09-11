import { SearchX } from 'lucide-react'
import { Accordion } from '@/components/ui/accordion'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import type {
  PermissionCatalogContext,
  PermissionModuleGroup,
} from '../../types/tenant-access-control.types'
import { PermissionModuleSection } from './PermissionModuleSection'

interface PermissionCatalogProps {
  readonly groups: PermissionModuleGroup[]
  readonly context: PermissionCatalogContext
  readonly openModules: string[]
  readonly disabled?: boolean
  readonly hasSearch: boolean
  readonly emptyTitle?: string
  readonly emptyDescription?: string
  readonly onOpenModulesChange: (modules: string[]) => void
  readonly onTogglePermission: (permissionId: string) => void
  readonly onToggleModule: (permissionIds: string[]) => void
}

export function PermissionCatalog({
  groups,
  context,
  openModules,
  disabled,
  hasSearch,
  emptyTitle,
  emptyDescription,
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
            {emptyTitle ??
              (hasSearch ? 'Không tìm thấy quyền phù hợp' : 'Chưa có quyền để cấu hình')}
          </EmptyTitle>
          <EmptyDescription>
            {emptyDescription ??
              (hasSearch
                ? 'Thử từ khóa khác theo tên quyền, mô tả hoặc phân hệ.'
                : 'Backend chưa cung cấp quyền vận hành có thể ủy quyền cho tenant.')}
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
          context={context}
          disabled={disabled}
          onTogglePermission={onTogglePermission}
          onToggleModule={onToggleModule}
        />
      ))}
    </Accordion>
  )
}
