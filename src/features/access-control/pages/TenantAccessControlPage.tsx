'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  AccessControlSkeleton,
  AccessControlState,
  AccessControlWorkspace,
  PersonalPermissionWorkspace,
} from '../components/TenantAccessControlPage'
import {
  usePermissionSubjectsQuery,
  useResetTenantUserPermissionsMutation,
  useTenantAccessControlQuery,
  useTenantUserPermissionsQuery,
  useUpdateTenantRolePermissionsMutation,
  useUpdateTenantUserPermissionsMutation,
} from '../hooks/use-tenant-access-control'
import type { AccessControlMode } from '../types/tenant-access-control.types'

const SUBJECT_PAGE_SIZE = 20

export default function TenantAccessControlPage() {
  const [activeMode, setActiveMode] = useState<AccessControlMode>('role')
  const [personalRoleId, setPersonalRoleId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [subjectSearch, setSubjectSearch] = useState('')
  const [subjectPage, setSubjectPage] = useState(0)
  const debouncedSubjectSearch = useDebouncedValue(subjectSearch.trim(), 300)
  const workspaceQuery = useTenantAccessControlQuery()
  const updatePermissionsMutation = useUpdateTenantRolePermissionsMutation()
  const effectiveRoleId = personalRoleId || workspaceQuery.data?.roles[0]?.roleId || ''
  const subjectQueryParams = {
    top: SUBJECT_PAGE_SIZE,
    skip: subjectPage * SUBJECT_PAGE_SIZE,
    needTotalCount: true as const,
    roleId: effectiveRoleId,
    ...(debouncedSubjectSearch ? { searchText: debouncedSubjectSearch } : {}),
  }
  const subjectsQuery = usePermissionSubjectsQuery(
    subjectQueryParams,
    activeMode === 'personal' && Boolean(effectiveRoleId)
  )
  const personalWorkspaceQuery = useTenantUserPermissionsQuery(
    selectedSubjectId || null,
    activeMode === 'personal'
  )
  const updateUserPermissionsMutation = useUpdateTenantUserPermissionsMutation()
  const resetUserPermissionsMutation = useResetTenantUserPermissionsMutation()

  async function savePermissions(roleId: string, permissionIds: string[]) {
    await updatePermissionsMutation.mutateAsync({ roleId, body: { permissionIds } })
    toast.success('Đã cập nhật quyền truy cập.')
  }

  async function saveUserPermissions(
    userId: string,
    expectedRoleId: string,
    permissionIds: string[]
  ) {
    await updateUserPermissionsMutation.mutateAsync({
      userId,
      body: { expectedRoleId, permissionIds },
    })
    const name = personalWorkspaceQuery.data?.subject.fullName ?? 'nhân sự'
    toast.success(`Đã cập nhật quyền cho ${name}.`)
  }

  async function resetUserPermissions(userId: string, expectedRoleId: string) {
    await resetUserPermissionsMutation.mutateAsync({ userId, body: { expectedRoleId } })
    toast.success('Đã khôi phục quyền mặc định theo vai trò.')
  }

  function changePersonalRole(roleId: string) {
    setPersonalRoleId(roleId)
    setSelectedSubjectId('')
    setSubjectSearch('')
    setSubjectPage(0)
  }

  function changeSubjectSearch(value: string) {
    setSubjectSearch(value)
    setSubjectPage(0)
  }

  if (workspaceQuery.isLoading) return <AccessControlSkeleton />

  if (workspaceQuery.isError) {
    return (
      <AccessControlState
        kind={workspaceQuery.error.statusCode === 403 ? 'forbidden' : 'error'}
        onRetry={() => void workspaceQuery.refetch()}
      />
    )
  }

  if (!workspaceQuery.data?.roles.length) {
    return <AccessControlState kind="empty-roles" />
  }

  if (!workspaceQuery.data.permissions.length) {
    return <AccessControlState kind="empty-permissions" />
  }

  const subjects =
    subjectsQuery.data?.items.filter((subject) => subject.roleId === effectiveRoleId) ?? []
  const selectedSubject =
    subjects.find((subject) => subject.userId === selectedSubjectId) ??
    (personalWorkspaceQuery.data
      ? {
          userId: personalWorkspaceQuery.data.subject.userId,
          fullName: personalWorkspaceQuery.data.subject.fullName,
          email: personalWorkspaceQuery.data.subject.email,
          roleId: personalWorkspaceQuery.data.subject.roleId,
          roleName: personalWorkspaceQuery.data.subject.roleName,
          assignedWarehouseCount: personalWorkspaceQuery.data.subject.warehouses.length,
          customizedPermissionCount: personalWorkspaceQuery.data.customizedPermissionIds.length,
        }
      : undefined)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {activeMode === 'role' ? (
        <AccessControlWorkspace
          activeMode={activeMode}
          workspace={workspaceQuery.data}
          saving={updatePermissionsMutation.isPending}
          onSave={savePermissions}
          onModeChange={setActiveMode}
        />
      ) : (
        <PersonalPermissionWorkspace
          key={selectedSubjectId || 'no-subject'}
          activeMode={activeMode}
          roles={workspaceQuery.data.roles}
          permissions={workspaceQuery.data.permissions}
          roleId={effectiveRoleId}
          subjects={subjects}
          selectedSubject={selectedSubject}
          subjectId={selectedSubjectId}
          subjectSearch={subjectSearch}
          subjectPage={subjectPage}
          subjectPageSize={SUBJECT_PAGE_SIZE}
          subjectTotalCount={subjectsQuery.data?.totalCount ?? 0}
          subjectsLoading={subjectsQuery.isFetching}
          subjectsError={subjectsQuery.error ?? null}
          workspace={personalWorkspaceQuery.data}
          workspaceLoading={personalWorkspaceQuery.isLoading}
          workspaceError={personalWorkspaceQuery.error ?? null}
          saving={updateUserPermissionsMutation.isPending}
          resetting={resetUserPermissionsMutation.isPending}
          onModeChange={setActiveMode}
          onRoleChange={changePersonalRole}
          onSubjectChange={setSelectedSubjectId}
          onSubjectSearchChange={changeSubjectSearch}
          onSubjectPageChange={setSubjectPage}
          onRetrySubjects={() => void subjectsQuery.refetch()}
          onRetryWorkspace={async () => {
            const result = await personalWorkspaceQuery.refetch()
            return result.isSuccess ? result.data : undefined
          }}
          onSave={saveUserPermissions}
          onReset={resetUserPermissions}
        />
      )}
    </div>
  )
}
