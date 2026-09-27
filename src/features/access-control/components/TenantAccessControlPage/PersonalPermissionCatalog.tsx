'use client'

import { useState } from 'react'
import { SearchX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { PermissionModuleGroup } from '../../types/tenant-access-control.types'
import { createPersonalPermissionRow } from '../../utils/tenant-access-control'
import { PermissionRow } from './PermissionRow'

interface PersonalPermissionCatalogProps {
  readonly groups: PermissionModuleGroup[]
  readonly subjectId: string
  readonly selectedIds: ReadonlySet<string>
  readonly roleDefaultIds: ReadonlySet<string>
  readonly disabled?: boolean
  readonly hasSearch: boolean
  readonly emptyTitle?: string
  readonly emptyDescription?: string
  readonly onTogglePermission: (permissionId: string) => void
  readonly onToggleModule: (permissionIds: string[]) => void
}

export function PersonalPermissionCatalog({
  groups,
  subjectId,
  selectedIds,
  roleDefaultIds,
  disabled,
  hasSearch,
  emptyTitle,
  emptyDescription,
  onTogglePermission,
  onToggleModule,
}: PersonalPermissionCatalogProps) {
  const [preferredModule, setPreferredModule] = useState('')
  const selectedGroup = groups.find((group) => group.module === preferredModule) ?? groups[0]

  if (!selectedGroup) {
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
                : 'Hiện chưa có quyền nào có thể phân cho nhân sự này.')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const rows = selectedGroup.permissions.map((permission) =>
    createPersonalPermissionRow(permission, selectedIds, roleDefaultIds)
  )
  const selectedCount = rows.filter((row) => row.checked).length
  const allSelected = rows.length > 0 && selectedCount === rows.length
  const someSelected = selectedCount > 0 && !allSelected

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
      <aside className="border-border hidden min-h-0 flex-col border-r lg:flex">
        <div className="border-border shrink-0 border-b px-3 py-2.5">
          <h3 className="text-xs font-semibold">Phân hệ</h3>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <nav className="flex flex-col gap-1 p-2" aria-label="Chọn phân hệ quyền">
            {groups.map((group) => {
              const active = group.module === selectedGroup.module
              const groupSelectedCount = group.permissions.filter((permission) =>
                selectedIds.has(permission.id)
              ).length

              return (
                <Button
                  key={group.module}
                  type="button"
                  variant={active ? 'secondary' : 'ghost'}
                  className="h-auto w-full justify-start gap-2 px-2.5 py-2 text-left"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => setPreferredModule(group.module)}
                >
                  <span className="min-w-0 flex-1 truncate">{group.moduleDisplayName}</span>
                  <Badge variant={active ? 'default' : 'outline'} className="tabular-nums">
                    {groupSelectedCount}/{group.permissions.length}
                  </Badge>
                </Button>
              )
            })}
          </nav>
        </ScrollArea>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-col" aria-labelledby="selected-module-title">
        <div className="border-border shrink-0 border-b p-3 lg:hidden">
          <label htmlFor="personal-permission-module" className="mb-1.5 block text-xs font-medium">
            Phân hệ
          </label>
          <Select value={selectedGroup.module} onValueChange={setPreferredModule}>
            <SelectTrigger id="personal-permission-module" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start" sideOffset={4}>
              <SelectGroup>
                {groups.map((group) => (
                  <SelectItem key={group.module} value={group.module}>
                    {group.moduleDisplayName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="border-border flex min-h-12 shrink-0 items-center gap-3 border-b px-3 sm:px-4">
          <Checkbox
            id={`personal-module-${selectedGroup.module}`}
            aria-label={`Chọn tất cả quyền trong ${selectedGroup.moduleDisplayName}`}
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            disabled={disabled || rows.length === 0}
            onCheckedChange={() =>
              onToggleModule(selectedGroup.permissions.map((permission) => permission.id))
            }
          />
          <label
            id="selected-module-title"
            htmlFor={`personal-module-${selectedGroup.module}`}
            className="min-w-0 flex-1 cursor-pointer truncate text-sm font-semibold"
          >
            {selectedGroup.moduleDisplayName}
          </label>
          <Badge variant={selectedCount > 0 ? 'secondary' : 'outline'} className="tabular-nums">
            {selectedCount}/{selectedGroup.permissions.length}
          </Badge>
        </div>

        <ScrollArea className="bg-muted/10 min-h-0 flex-1">
          <div className="grid grid-cols-1 gap-2 p-3 sm:p-4 xl:grid-cols-2">
            {rows.map((row) => (
              <PermissionRow
                key={row.permission.id}
                model={row}
                subjectId={subjectId}
                disabled={disabled}
                onToggle={onTogglePermission}
              />
            ))}
          </div>
        </ScrollArea>
      </section>
    </div>
  )
}
