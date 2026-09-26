'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
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
  const visibleRoles = roles.slice((page - 1) * pageSize, page * pageSize)

  async function savePermissions(permissionIds: string[]) {
    if (!selectedRole) return
    await assignMutation.mutateAsync({ roleId: selectedRole.id, body: { permissionIds } })
  }

  return (
    <Tabs defaultValue="roles" className="h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4">
      <TabsList variant="line" className="w-full shrink-0 justify-start gap-1 border-b">
        <TabsTrigger value="roles" className="cursor-pointer px-3 pb-2.5">
          Vai trò
        </TabsTrigger>
        <TabsTrigger value="permissions" className="cursor-pointer px-3 pb-2.5">
          Danh mục quyền
        </TabsTrigger>
      </TabsList>

      <TabsContent value="roles" className="mt-0 flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <RolesToolbar
          search={search}
          filter={filter}
          count={roles.length}
          isLoading={rolesQuery.isLoading}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          onFilterChange={(value) => {
            setFilter(value)
            setPage(1)
          }}
        />
        <OperationalListPanel aria-label="Danh sách vai trò">
          {rolesQuery.isError ? (
            <div
              data-slot="operational-list-body"
              className="flex min-h-48 items-center justify-center p-4"
            >
              <Alert variant="destructive">
                <AlertCircle className="size-4" aria-hidden="true" />
                <AlertTitle>Không thể tải danh sách vai trò</AlertTitle>
                <AlertDescription>Vui lòng thử tải lại trang.</AlertDescription>
              </Alert>
            </div>
          ) : (
            <RolesTable
              roles={visibleRoles}
              isLoading={rolesQuery.isLoading}
              onManagePermissions={setSelectedRole}
            />
          )}
          <OperationalPagination
            page={page}
            pageSize={pageSize}
            totalCount={roles.length}
            isPending={rolesQuery.isFetching}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value)
              setPage(1)
            }}
          />
        </OperationalListPanel>
      </TabsContent>

      <TabsContent value="permissions" className="mt-0 min-h-0 min-w-0 flex-1 overflow-y-auto">
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
