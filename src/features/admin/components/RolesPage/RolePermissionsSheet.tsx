'use client'

import { useState, useSyncExternalStore } from 'react'
import { AlertCircle, LockKeyhole, Search, ShieldCheck } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { getRoleDescription, getRoleLabel } from '@/config/roles'
import type { PermissionResponse, RoleResponse } from '../../types/admin.types'
import { groupAdminPermissions } from '../../utils/permission-catalog'
import { PermissionCatalog } from './PermissionCatalog'

interface RolePermissionsSheetProps {
  readonly open: boolean
  readonly role: RoleResponse | null
  readonly permissions: PermissionResponse[]
  readonly canManagePlatformPermissions: boolean
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isSaving: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onRetry: () => void
  readonly onSave: (permissionIds: string[]) => Promise<void>
}

const subscribe = () => () => undefined
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function RolePermissionsSheet({
  open,
  role,
  permissions,
  canManagePlatformPermissions,
  isLoading,
  isError,
  isSaving,
  onOpenChange,
  onRetry,
  onSave,
}: RolePermissionsSheetProps) {
  const isMounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
  const [search, setSearch] = useState('')
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)
  const assignablePermissions = canManagePlatformPermissions
    ? permissions
    : permissions.filter((permission) => permission.scope !== 'PlatformOnly')
  const assignedPermissions = canManagePlatformPermissions
    ? (role?.permissions ?? [])
    : (role?.permissions ?? []).filter((permission) => permission.scope !== 'PlatformOnly')
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(assignedPermissions.map((permission) => permission.id))
  )
  const groups = groupAdminPermissions(assignablePermissions)
  const isDirty =
    selected.size !== assignedPermissions.length ||
    assignedPermissions.some((permission) => !selected.has(permission.id))

  if (!isMounted || !role) return null

  function togglePermission(permissionId: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(permissionId)) next.delete(permissionId)
      else next.add(permissionId)
      return next
    })
  }

  function toggleModule(permissionIds: string[]) {
    const allSelected = permissionIds.every((permissionId) => selected.has(permissionId))
    setSelected((current) => {
      const next = new Set(current)
      for (const permissionId of permissionIds) {
        if (allSelected) next.delete(permissionId)
        else next.add(permissionId)
      }
      return next
    })
  }

  function requestClose() {
    if (isSaving) return
    if (isDirty) setConfirmCloseOpen(true)
    else onOpenChange(false)
  }

  async function handleSave() {
    await onSave([...selected])
    onOpenChange(false)
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) requestClose()
        }}
      >
        <SheetContent
          className="flex w-full flex-col gap-0 overscroll-contain p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none lg:data-[side=right]:w-3/4"
          side="right"
        >
          <SheetHeader className="shrink-0 border-b px-5 py-4 pr-12">
            <SheetTitle className="flex items-center gap-2 text-sm">
              <ShieldCheck className="text-primary size-4" aria-hidden="true" />
              <span className="min-w-0 truncate">Phân quyền · {getRoleLabel(role.roleName)}</span>
              <Badge variant="secondary" className="ml-auto shrink-0 text-xs font-normal">
                {selected.size}/{assignablePermissions.length}
              </Badge>
            </SheetTitle>
            <SheetDescription>
              {getRoleDescription(role.roleName, role.description)}
            </SheetDescription>
          </SheetHeader>

          <div className="flex shrink-0 flex-col gap-2 border-b px-4 py-3">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                type="search"
                name="role-permission-search"
                autoComplete="off"
                spellCheck={false}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo danh mục, phân hệ hoặc quyền…"
                aria-label="Tìm quyền trong vai trò"
                className="h-8 pl-8 text-xs"
              />
            </div>
            {!canManagePlatformPermissions ? (
              <Alert className="py-2">
                <LockKeyhole aria-hidden="true" />
                <AlertDescription>
                  Quyền quản trị nền tảng không áp dụng cho vai trò doanh nghiệp.
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 p-3 sm:p-4">
            {isLoading ? (
              <div className="grid h-full min-h-64 gap-3 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
                <Skeleton className="h-full rounded-md" />
                <Skeleton className="h-full rounded-md" />
              </div>
            ) : isError ? (
              <Alert variant="destructive">
                <AlertCircle aria-hidden="true" />
                <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                  <span>Không thể tải danh mục quyền.</span>
                  <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                    Thử lại
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <PermissionCatalog
                mode="editable"
                groups={groups}
                searchText={search}
                selectedIds={selected}
                disabled={isSaving}
                onTogglePermission={togglePermission}
                onToggleModule={toggleModule}
              />
            )}
          </div>

          <SheetFooter className="shrink-0 flex-row items-center justify-between border-t px-5 py-3.5">
            <span className="text-muted-foreground text-xs">
              {isDirty ? 'Có thay đổi chưa lưu' : `${selected.size} quyền đã gán`}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={requestClose}
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleSave()}
                disabled={!isDirty || isSaving || isError}
              >
                {isSaving ? 'Đang lưu…' : 'Lưu quyền hạn'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bỏ các thay đổi chưa lưu?</AlertDialogTitle>
            <AlertDialogDescription>
              Các quyền vừa chỉnh sửa sẽ không được áp dụng cho vai trò này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmCloseOpen(false)
                onOpenChange(false)
              }}
            >
              Bỏ thay đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
