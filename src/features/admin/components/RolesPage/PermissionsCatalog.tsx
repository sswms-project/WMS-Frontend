import { useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { PermissionResponse } from '../../types/admin.types'

interface PermissionsCatalogProps {
  readonly permissions: PermissionResponse[]
  readonly isLoading: boolean
}

function matchesPermission(permission: PermissionResponse, query: string) {
  const searchable = [
    permission.permissionKey,
    permission.displayName,
    permission.moduleDisplayName,
    permission.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('vi-VN')
  return searchable.includes(query.trim().toLocaleLowerCase('vi-VN'))
}

export function PermissionsCatalog({ permissions, isLoading }: PermissionsCatalogProps) {
  const [search, setSearch] = useState('')
  const filtered = permissions.filter((permission) => matchesPermission(permission, search))
  const grouped = filtered.reduce<Record<string, PermissionResponse[]>>((groups, permission) => {
    const moduleName = permission.moduleDisplayName || permission.module
    groups[moduleName] ??= []
    groups[moduleName].push(permission)
    return groups
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-sm font-semibold">Danh mục quyền</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            {filtered.length}/{permissions.length} quyền từ hệ thống
          </p>
        </div>
        <div className="relative sm:w-64">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm quyền..."
            aria-label="Tìm quyền"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !Object.keys(grouped).length ? (
        <Card className="rounded-xl">
          <CardContent className="text-muted-foreground py-14 text-center text-sm">
            Không tìm thấy quyền phù hợp.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {Object.entries(grouped).map(([moduleName, modulePermissions]) => (
            <Card key={moduleName} className="gap-0 rounded-xl py-0">
              <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
                <CardTitle className="text-sm">{moduleName}</CardTitle>
                <Badge variant="secondary">{modulePermissions.length}</Badge>
              </CardHeader>
              <CardContent className="divide-y px-4 py-1">
                {modulePermissions.map((permission) => (
                  <div key={permission.id} className="py-3">
                    <p className="text-foreground text-sm font-medium">
                      {permission.displayName || permission.permissionKey}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">
                      {permission.description || 'Không có mô tả cho quyền này.'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
