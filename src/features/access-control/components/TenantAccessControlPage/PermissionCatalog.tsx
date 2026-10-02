import { useId, useState } from 'react'
import {
  Building2,
  ChartNoAxesCombined,
  CreditCard,
  FolderKey,
  LayoutDashboard,
  PackageOpen,
  SearchX,
  Settings,
  Tags,
  Users,
  Warehouse,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Accordion } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  PermissionCategoryGroup,
  PermissionCatalogContext,
} from '../../types/tenant-access-control.types'
import { PermissionModuleSection } from './PermissionModuleSection'

interface PermissionCatalogProps {
  readonly groups: PermissionCategoryGroup[]
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

const CATEGORY_ICONS: Readonly<Record<string, LucideIcon>> = {
  workspace: LayoutDashboard,
  'organization-management': Building2,
  'warehouse-management': Warehouse,
  subjects: Users,
  catalog: Tags,
  'warehouse-operations': PackageOpen,
  reports: ChartNoAxesCombined,
  services: CreditCard,
  system: Settings,
}

function getPermissionCounts(category: PermissionCategoryGroup, selectedIds: ReadonlySet<string>) {
  const permissions = category.modules.flatMap((module) => module.permissions)
  return {
    selected: permissions.filter((permission) => selectedIds.has(permission.id)).length,
    total: permissions.length,
  }
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
  const catalogId = useId()
  const [preferredCategory, setPreferredCategory] = useState('')

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
                : 'Hiện chưa có quyền nào có thể phân cho vai trò này.')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const selectedCategory =
    groups.find((category) => category.category === preferredCategory) ?? groups[0]!
  const selectedCategoryModuleIds = new Set(selectedCategory.modules.map((module) => module.module))
  const visibleOpenModules = hasSearch
    ? [...selectedCategoryModuleIds]
    : openModules.filter((module) => selectedCategoryModuleIds.has(module))
  const selectedCategoryCounts = getPermissionCounts(selectedCategory, context.selectedIds)
  const categoryHeadingId = `${catalogId}-category-${selectedCategory.category}`
  const categorySelectId = `${catalogId}-category-select`

  function changeOpenModules(modules: string[]) {
    if (hasSearch) return
    onOpenModulesChange([
      ...openModules.filter((module) => !selectedCategoryModuleIds.has(module)),
      ...modules,
    ])
  }

  return (
    <div className="border-border bg-card grid h-full min-h-[28rem] min-w-0 flex-1 overflow-hidden rounded-md border lg:min-h-0 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
      <aside className="border-border hidden min-h-0 border-r lg:flex lg:flex-col">
        <div className="border-border border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Danh mục quyền</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">Chọn danh mục để xem các phân hệ.</p>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <nav aria-label="Chọn danh mục quyền" className="space-y-1 p-2">
            {groups.map((category) => {
              const active = category.category === selectedCategory.category
              const counts = getPermissionCounts(category, context.selectedIds)
              const Icon = CATEGORY_ICONS[category.category] ?? FolderKey

              return (
                <Button
                  key={category.category}
                  type="button"
                  variant={active ? 'secondary' : 'ghost'}
                  aria-current={active ? 'page' : undefined}
                  className="h-auto min-h-11 w-full justify-start gap-2.5 px-3 py-2 text-left"
                  onClick={() => setPreferredCategory(category.category)}
                >
                  <Icon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-sm font-medium break-words whitespace-normal">
                    {category.categoryDisplayName}
                  </span>
                  <Badge
                    variant={counts.selected > 0 ? 'secondary' : 'outline'}
                    className="shrink-0 tabular-nums"
                    aria-label={`${counts.selected} trên ${counts.total} quyền đã chọn`}
                  >
                    {counts.selected}/{counts.total}
                  </Badge>
                </Button>
              )
            })}
          </nav>
        </ScrollArea>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-col" aria-labelledby={categoryHeadingId}>
        <div className="border-border border-b p-3 lg:hidden">
          <label htmlFor={categorySelectId} className="mb-1.5 block text-xs font-medium">
            Danh mục quyền
          </label>
          <Select value={selectedCategory.category} onValueChange={setPreferredCategory}>
            <SelectTrigger id={categorySelectId} className="w-full">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={4}>
              <SelectGroup>
                {groups.map((category) => {
                  const counts = getPermissionCounts(category, context.selectedIds)
                  const Icon = CATEGORY_ICONS[category.category] ?? FolderKey

                  return (
                    <SelectItem
                      key={category.category}
                      value={category.category}
                      textValue={category.categoryDisplayName}
                    >
                      <Icon aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">
                        {category.categoryDisplayName}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {counts.selected}/{counts.total}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <header className="border-border flex min-w-0 items-start justify-between gap-3 border-b px-3 py-3 sm:px-4">
          <div className="min-w-0">
            <h3 id={categoryHeadingId} className="text-base font-semibold text-pretty break-words">
              {selectedCategory.categoryDisplayName}
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs text-pretty break-words">
              {selectedCategory.categoryDescription}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 tabular-nums">
            {selectedCategoryCounts.selected}/{selectedCategoryCounts.total} quyền
          </Badge>
        </header>

        <ScrollArea className="bg-muted/10 min-h-0 flex-1">
          <Accordion
            type="multiple"
            value={visibleOpenModules}
            onValueChange={changeOpenModules}
            className="bg-card"
          >
            {selectedCategory.modules.map((group) => (
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
        </ScrollArea>
      </section>
    </div>
  )
}
