'use client'

import { toast } from 'sonner'
import {
  AccessControlHeader,
  AccessControlSkeleton,
  AccessControlState,
  AccessControlWorkspace,
} from '../components/TenantAccessControlPage'
import {
  useTenantAccessControlQuery,
  useUpdateTenantRolePermissionsMutation,
} from '../hooks/use-tenant-access-control'

export default function TenantAccessControlPage() {
  const workspaceQuery = useTenantAccessControlQuery()
  const updatePermissionsMutation = useUpdateTenantRolePermissionsMutation()

  async function savePermissions(roleId: string, permissionIds: string[]) {
    await updatePermissionsMutation.mutateAsync({ roleId, body: { permissionIds } })
    toast.success('Đã cập nhật quyền truy cập.')
  }

  if (workspaceQuery.isLoading) return <AccessControlSkeleton />

  if (workspaceQuery.isError) {
    return (
      <div className="flex flex-col gap-4">
        <AccessControlHeader />
        <AccessControlState
          kind={workspaceQuery.error.statusCode === 403 ? 'forbidden' : 'error'}
          onRetry={() => void workspaceQuery.refetch()}
        />
      </div>
    )
  }

  if (!workspaceQuery.data?.roles.length) {
    return (
      <div className="flex flex-col gap-4">
        <AccessControlHeader />
        <AccessControlState kind="empty-roles" />
      </div>
    )
  }

  if (!workspaceQuery.data.permissions.length) {
    return (
      <div className="flex flex-col gap-4">
        <AccessControlHeader />
        <AccessControlState kind="empty-permissions" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <AccessControlHeader />
      <AccessControlWorkspace
        workspace={workspaceQuery.data}
        saving={updatePermissionsMutation.isPending}
        onSave={savePermissions}
      />
    </div>
  )
}
