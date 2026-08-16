'use client'

import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAssignPermissionsMutation, usePermissionsQuery } from '../../hooks/use-admin'
import type { PermissionResponse, RoleResponse } from '../../types/admin.types'

interface RolePermissionEditorProps {
  readonly role: RoleResponse
}

function groupByModule(permissions: PermissionResponse[]) {
  return permissions.reduce<Record<string, PermissionResponse[]>>((acc, permission) => {
    const group = acc[permission.module] ?? []
    group.push(permission)
    acc[permission.module] = group
    return acc
  }, {})
}

export function RolePermissionEditor({ role }: RolePermissionEditorProps) {
  const { data: allPermissions, isLoading } = usePermissionsQuery()
  const assignMutation = useAssignPermissionsMutation()
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(role.permissions.map((permission) => permission.id))
  )

  useEffect(() => {
    queueMicrotask(() => {
      setSelected(new Set(role.permissions.map((permission) => permission.id)))
    })
  }, [role])

  function togglePermission(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleModule(modulePermissions: PermissionResponse[]) {
    const allChecked = modulePermissions.every((p) => selected.has(p.id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allChecked) modulePermissions.forEach((p) => next.delete(p.id))
      else modulePermissions.forEach((p) => next.add(p.id))
      return next
    })
  }

  function handleSave() {
    assignMutation.mutate({ roleId: role.id, body: { permissionIds: Array.from(selected) } })
  }

  const isDirty =
    selected.size !== role.permissions.length || role.permissions.some((p) => !selected.has(p.id))

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    )
  }

  if (!allPermissions?.length) {
    return <p className="text-muted-foreground p-4 text-sm">Không có quyền nào trong hệ thống.</p>
  }

  const grouped = groupByModule(allPermissions)

  return (
    <div className="space-y-4 p-4">
      {Object.entries(grouped).map(([module, permissions]) => {
        const allChecked = permissions.every((p) => selected.has(p.id))
        const someChecked = permissions.some((p) => selected.has(p.id))

        return (
          <div key={module}>
            <div className="flex items-center gap-2">
              <Checkbox
                id={`module-${module}`}
                checked={allChecked}
                data-state={someChecked && !allChecked ? 'indeterminate' : undefined}
                onCheckedChange={() => toggleModule(permissions)}
              />
              <Label
                htmlFor={`module-${module}`}
                className="text-foreground cursor-pointer text-sm font-semibold capitalize"
              >
                {module}
              </Label>
              <Badge variant="secondary" className="ml-auto text-xs">
                {permissions.filter((p) => selected.has(p.id)).length}/{permissions.length}
              </Badge>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:ml-6 sm:grid-cols-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex min-w-0 items-center gap-2">
                  <Checkbox
                    id={permission.id}
                    checked={selected.has(permission.id)}
                    onCheckedChange={() => togglePermission(permission.id)}
                  />
                  <Label
                    htmlFor={permission.id}
                    className="text-muted-foreground min-w-0 cursor-pointer text-xs break-words"
                  >
                    {permission.permissionKey.split(':')[1] ?? permission.permissionKey}
                  </Label>
                </div>
              ))}
            </div>
            <Separator className="mt-4" />
          </div>
        )
      })}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || assignMutation.isPending}
          className="w-full gap-2 sm:w-auto"
        >
          <Shield className="size-3.5" aria-hidden="true" />
          {assignMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
        {isDirty && <p className="text-on-primary-container text-xs">Có thay đổi chưa được lưu</p>}
      </div>
    </div>
  )
}
