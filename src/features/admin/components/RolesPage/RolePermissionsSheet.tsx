'use client'

import { useState, useSyncExternalStore } from 'react'
import { Search, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { PermissionModuleGroup } from './PermissionModuleGroup'
import type { PermissionResponse, RoleResponse } from '../../types/admin.types'

interface RolePermissionsSheetProps {
  readonly open: boolean
  readonly role: RoleResponse | null
  readonly permissions: PermissionResponse[]
  readonly isLoading: boolean
  readonly isSaving: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (permissionIds: string[]) => Promise<void>
}

function groupPermissions(permissions: PermissionResponse[]) {
  return permissions.reduce<Record<string, PermissionResponse[]>>((groups, permission) => {
    const moduleName = permission.moduleDisplayName || permission.module
    groups[moduleName] ??= []
    groups[moduleName].push(permission)
    return groups
  }, {})
}

const subscribe = () => () => undefined
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function RolePermissionsSheet({
  open,
  role,
  permissions,
  isLoading,
  isSaving,
  onOpenChange,
  onSave,
}: RolePermissionsSheetProps) {
  const isMounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(role?.permissions.map((permission) => permission.id))
  )
  const [openModules, setOpenModules] = useState<Set<string>>(new Set())

  if (!isMounted || !role) return null

  const query = search.trim().toLocaleLowerCase('vi-VN')
  const visiblePermissions = permissions.filter((permission) =>
    [permission.permissionKey, permission.displayName, permission.description]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('vi-VN')
      .includes(query)
  )
  const grouped = groupPermissions(visiblePermissions)
  const isDirty =
    selected.size !== role.permissions.length ||
    role.permissions.some((permission) => !selected.has(permission.id))

  function togglePermission(permissionId: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(permissionId)) next.delete(permissionId)
      else next.add(permissionId)
      return next
    })
  }

  function toggleModule(moduleName: string, modulePermissions: PermissionResponse[]) {
    const allSelected = modulePermissions.every((permission) => selected.has(permission.id))
    setSelected((current) => {
      const next = new Set(current)
      modulePermissions.forEach((permission) => {
        if (allSelected) next.delete(permission.id)
        else next.add(permission.id)
      })
      return next
    })
    setOpenModules((current) => {
      const next = new Set(current)
      next.add(moduleName)
      return next
    })
  }

  function toggleModuleOpen(moduleName: string) {
    setOpenModules((current) => {
      const next = new Set(current)
      if (next.has(moduleName)) next.delete(moduleName)
      else next.add(moduleName)
      return next
    })
  }

  async function handleSave() {
    await onSave(Array.from(selected))
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none lg:data-[side=right]:w-1/2"
        side="right"
      >
        <SheetHeader className="shrink-0 border-b px-5 py-4 pr-12">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck className="text-primary size-4" aria-hidden="true" />
            Phân quyền · {role.roleName}
            <Badge variant="secondary" className="ml-auto text-xs font-normal">
              {selected.size}/{permissions.length}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            {role.description || 'Thiết lập quyền truy cập cho vai trò này.'}
          </SheetDescription>
        </SheetHeader>

        <div className="shrink-0 border-b px-4 py-2.5">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên quyền, mã quyền hoặc mô tả..."
              aria-label="Tìm quyền trong vai trò"
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1" type="always">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }, (_, index) => (
                <Skeleton key={index} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <div>
              {Object.entries(grouped).map(([moduleName, modulePermissions]) => (
                <PermissionModuleGroup
                  key={moduleName}
                  moduleName={moduleName}
                  permissions={modulePermissions}
                  selected={selected}
                  isOpen={openModules.has(moduleName)}
                  onToggle={() => toggleModule(moduleName, modulePermissions)}
                  onToggleOpen={() => toggleModuleOpen(moduleName)}
                  onTogglePermission={togglePermission}
                />
              ))}
              {!Object.keys(grouped).length && (
                <p className="text-muted-foreground py-16 text-center text-sm">
                  Không tìm thấy quyền phù hợp.
                </p>
              )}
            </div>
          )}
        </ScrollArea>

        <SheetFooter className="shrink-0 flex-row items-center justify-between border-t px-5 py-3.5">
          <span className="text-muted-foreground text-xs">{selected.size} quyền đã gán</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSave()}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? 'Đang lưu…' : 'Lưu quyền hạn'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
