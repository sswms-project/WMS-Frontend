'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PermissionsCatalog,
  RolePermissionsSheet,
  RolesTable,
  RolesToolbar,
  type RoleFilter,
} from '../components/RolesPage'
import {
  useAssignPermissionsMutation,
  usePermissionsQuery,
  useRolesQuery,
} from '../hooks/use-admin'
import type { RoleResponse } from '../types/admin.types'

export default function RolesPage() {
  const rolesQuery = useRolesQuery()
  const permissionsQuery = usePermissionsQuery()
  const assignMutation = useAssignPermissionsMutation()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<RoleFilter>('all')
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null)

  const query = search.trim().toLocaleLowerCase('vi-VN')
  const roles = (rolesQuery.data ?? []).filter((role) => {
    const matchesSearch =
      !query ||
      [role.roleName, role.description]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('vi-VN')
        .includes(query)
    const matchesFilter =
      filter === 'all' || (filter === 'system' ? role.isSystemRole : !role.isSystemRole)
    return matchesSearch && matchesFilter
  })

  async function savePermissions(permissionIds: string[]) {
    if (!selectedRole) return
    await assignMutation.mutateAsync({ roleId: selectedRole.id, body: { permissionIds } })
  }

  return (
    <Tabs defaultValue="roles" className="gap-4">
      <TabsList variant="line" className="w-full justify-start gap-1 border-b">
        <TabsTrigger value="roles" className="cursor-pointer px-3 pb-2.5">
          Vai trò
        </TabsTrigger>
        <TabsTrigger value="permissions" className="cursor-pointer px-3 pb-2.5">
          Danh mục quyền
        </TabsTrigger>
      </TabsList>

      <TabsContent value="roles" className="mt-0 space-y-3">
        <RolesToolbar
          search={search}
          filter={filter}
          count={roles.length}
          isLoading={rolesQuery.isLoading}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
        />
        {rolesQuery.isError ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertTitle>Không thể tải danh sách vai trò</AlertTitle>
            <AlertDescription>Vui lòng thử tải lại trang.</AlertDescription>
          </Alert>
        ) : (
          <RolesTable
            roles={roles}
            isLoading={rolesQuery.isLoading}
            onManagePermissions={setSelectedRole}
          />
        )}
      </TabsContent>

      <TabsContent value="permissions" className="mt-0">
        <PermissionsCatalog
          permissions={permissionsQuery.data ?? []}
          isLoading={permissionsQuery.isLoading}
        />
      </TabsContent>

      <RolePermissionsSheet
        key={selectedRole?.id ?? 'closed'}
        open={Boolean(selectedRole)}
        role={selectedRole}
        permissions={permissionsQuery.data ?? []}
        isLoading={permissionsQuery.isLoading}
        isSaving={assignMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setSelectedRole(null)
        }}
        onSave={savePermissions}
      />
    </Tabs>
  )
}
