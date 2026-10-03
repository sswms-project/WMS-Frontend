'use client'

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
  ShieldCheck,
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
import { cn } from '@/lib/utils'
import type { AdminPermissionCategoryGroup } from '../../types/admin.types'
import { filterAdminPermissionGroups } from '../../utils/permission-catalog'
import { PermissionModuleGroup } from './PermissionModuleGroup'

interface PermissionCatalogBaseProps {
  readonly groups: AdminPermissionCategoryGroup[]
  readonly searchText: string
}

interface ReadOnlyPermissionCatalogProps extends PermissionCatalogBaseProps {
  readonly mode: 'readOnly'
}

interface EditablePermissionCatalogProps extends PermissionCatalogBaseProps {
  readonly mode: 'editable'
  readonly selectedIds: ReadonlySet<string>
  readonly disabled?: boolean
  readonly onTogglePermission: (permissionId: string) => void
  readonly onToggleModule: (permissionIds: string[]) => void
}

type PermissionCatalogProps = ReadOnlyPermissionCatalogProps | EditablePermissionCatalogProps

const CATEGORY_ICONS: Readonly<Record<string, LucideIcon>> = {
  workspace: LayoutDashboard,
  'platform-administration': ShieldCheck,
  'organization-management': Building2,
  'warehouse-management': Warehouse,
  subjects: Users,
  catalog: Tags,
  'warehouse-operations': PackageOpen,
  reports: ChartNoAxesCombined,
  services: CreditCard,
  system: Settings,
}

function getPermissions(category: AdminPermissionCategoryGroup) {
  return category.modules.flatMap((module) => module.permissions)
}

export function PermissionCatalog(props: PermissionCatalogProps) {
  const catalogId = useId()
  const [preferredCategory, setPreferredCategory] = useState('')
  const [openModules, setOpenModules] = useState<string[]>([])
  const visibleGroups = filterAdminPermissionGroups(props.groups, props.searchText)
  const hasSearch = props.searchText.trim().length > 0

  if (visibleGroups.length === 0) {
    return (
      <Empty className="h-full min-h-64">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            {hasSearch ? 'Không tìm thấy quyền phù hợp' : 'Chưa có quyền để hiển thị'}
          </EmptyTitle>
          <EmptyDescription>
            {hasSearch
              ? 'Thử từ khóa khác theo danh mục, phân hệ hoặc quyền.'
              : 'Danh mục quyền hiện chưa có dữ liệu.'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const selectedCategory =
    visibleGroups.find((category) => category.category === preferredCategory) ?? visibleGroups[0]!
  const completeCategory =
    props.groups.find((category) => category.category === selectedCategory.category) ??
    selectedCategory
  const selectedCategoryModuleIds = new Set(selectedCategory.modules.map((module) => module.module))
  const visibleOpenModules = hasSearch
    ? [...selectedCategoryModuleIds]
    : openModules.filter((module) => selectedCategoryModuleIds.has(module))
  const categoryPermissions = getPermissions(completeCategory)
  const selectedCategoryCount =
    props.mode === 'editable'
      ? categoryPermissions.filter((permission) => props.selectedIds.has(permission.id)).length
      : 0
  const categoryHeadingId = `${catalogId}-category-${selectedCategory.category}`
  const categorySelectId = `${catalogId}-category-select`

  function changeOpenModules(modules: string[]) {
    if (hasSearch) return
    setOpenModules((current) => [
      ...current.filter((module) => !selectedCategoryModuleIds.has(module)),
      ...modules,
    ])
  }

  function renderCategoryCount(category: AdminPermissionCategoryGroup) {
    const completeCategory =
      props.groups.find((item) => item.category === category.category) ?? category
    const permissions = getPermissions(completeCategory)
    if (props.mode === 'readOnly') return `${permissions.length}`
    const selectedCount = permissions.filter((permission) =>
      props.selectedIds.has(permission.id)
    ).length
    return `${selectedCount}/${permissions.length}`
  }

  return (
    <div className="border-border bg-card grid h-full min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
      <aside className="border-border hidden min-h-0 border-r lg:flex lg:flex-col">
        <div className="border-border border-b px-4 py-3">
          <h3 className="text-base font-semibold">Danh mục quyền</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">Chọn danh mục để xem các phân hệ.</p>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <nav aria-label="Chọn danh mục quyền" className="flex flex-col gap-1 p-2">
            {visibleGroups.map((category) => {
              const active = category.category === selectedCategory.category
              const Icon = CATEGORY_ICONS[category.category] ?? FolderKey

              return (
                <Button
                  key={category.category}
                  type="button"
                  variant={active ? 'default' : 'ghost'}
                  aria-current={active ? 'true' : undefined}
                  className="h-auto min-h-11 w-full justify-start gap-2.5 px-3 py-2 text-left"
                  onClick={() => setPreferredCategory(category.category)}
                >
                  <Icon aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-sm font-medium break-words whitespace-normal">
                    {category.categoryDisplayName}
                  </span>
                  <Badge
                    variant={active ? 'outline' : 'secondary'}
                    className={cn(
                      'shrink-0 tabular-nums',
                      active && 'border-primary-foreground/50 text-primary-foreground'
                    )}
                    aria-label={`${renderCategoryCount(category)} quyền`}
                  >
                    {renderCategoryCount(category)}
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
                {visibleGroups.map((category) => {
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
                        {renderCategoryCount(category)}
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
            {props.mode === 'editable'
              ? `${selectedCategoryCount}/${categoryPermissions.length} quyền`
              : `${categoryPermissions.length} quyền`}
          </Badge>
        </header>

        <ScrollArea className="bg-muted/10 min-h-0 flex-1">
          <Accordion
            type="multiple"
            value={visibleOpenModules}
            onValueChange={changeOpenModules}
            className="bg-card"
          >
            {selectedCategory.modules.map((group) => {
              const completeGroup =
                completeCategory.modules.find((module) => module.module === group.module) ?? group
              return props.mode === 'editable' ? (
                <PermissionModuleGroup
                  key={group.module}
                  mode="editable"
                  group={group}
                  completeGroup={completeGroup}
                  selectedIds={props.selectedIds}
                  disabled={props.disabled}
                  onTogglePermission={props.onTogglePermission}
                  onToggleModule={props.onToggleModule}
                />
              ) : (
                <PermissionModuleGroup
                  key={group.module}
                  mode="readOnly"
                  group={group}
                  completeGroup={completeGroup}
                />
              )
            })}
          </Accordion>
        </ScrollArea>
      </section>
    </div>
  )
}
