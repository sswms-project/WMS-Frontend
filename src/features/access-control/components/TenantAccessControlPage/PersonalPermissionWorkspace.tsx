'use client'

import { TriangleAlert, UserRoundSearch } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/api-error'
import type { ApiErrorResponse } from '@/types/api'
import type {
  AccessControlMode,
  TenantAssignablePermission,
  TenantRolePolicy,
  TenantUserPermissionSubject,
  TenantUserPermissionWorkspace,
} from '../../types/tenant-access-control.types'
import { getTenantRoleContent } from '../../utils/tenant-access-control'
import { getPersonalPermissionErrorDetails } from '../../utils/tenant-user-permission-error'
import { AccessControlModeTabs } from './AccessControlModeTabs'
import { PersonalPermissionEditor } from './PersonalPermissionEditor'
import { PermissionSubjectSelector } from './PermissionSubjectSelector'
import { ResetUserPermissionsDialog } from './ResetUserPermissionsDialog'
import { UnsavedChangesDialog } from './UnsavedChangesDialog'
import { usePersonalPermissionEditorState } from './PersonalPermissionWorkspace/use-personal-permission-editor-state'
import { useUnsavedPersonalNavigation } from './PersonalPermissionWorkspace/use-unsaved-personal-navigation'

interface PersonalPermissionWorkspaceProps {
  readonly activeMode: AccessControlMode
  readonly roles: TenantRolePolicy[]
  readonly permissions: TenantAssignablePermission[]
  readonly roleId: string
  readonly subjects: TenantUserPermissionSubject[]
  readonly selectedSubject?: TenantUserPermissionSubject
  readonly subjectId: string
  readonly subjectSearch: string
  readonly subjectPage: number
  readonly subjectPageSize: number
  readonly subjectTotalCount: number
  readonly subjectsLoading: boolean
  readonly subjectsError: ApiErrorResponse | null
  readonly workspace?: TenantUserPermissionWorkspace
  readonly workspaceLoading: boolean
  readonly workspaceError: ApiErrorResponse | null
  readonly saving: boolean
  readonly resetting: boolean
  readonly onModeChange: (mode: AccessControlMode) => void
  readonly onRoleChange: (roleId: string) => void
  readonly onSubjectChange: (userId: string) => void
  readonly onSubjectSearchChange: (value: string) => void
  readonly onSubjectPageChange: (page: number) => void
  readonly onRetrySubjects: () => void
  readonly onRetryWorkspace: () => Promise<TenantUserPermissionWorkspace | undefined>
  readonly onSave: (
    userId: string,
    expectedRoleId: string,
    permissionIds: string[]
  ) => Promise<void>
  readonly onReset: (userId: string, expectedRoleId: string) => Promise<void>
}

export function PersonalPermissionWorkspace({
  activeMode,
  roles,
  permissions,
  roleId,
  subjects,
  selectedSubject,
  subjectId,
  subjectSearch,
  subjectPage,
  subjectPageSize,
  subjectTotalCount,
  subjectsLoading,
  subjectsError,
  workspace,
  workspaceLoading,
  workspaceError,
  saving,
  resetting,
  onModeChange,
  onRoleChange,
  onSubjectChange,
  onSubjectSearchChange,
  onSubjectPageChange,
  onRetrySubjects,
  onRetryWorkspace,
  onSave,
  onReset,
}: PersonalPermissionWorkspaceProps) {
  const selectedRole = roles.find((role) => role.roleId === roleId)
  const editor = usePersonalPermissionEditorState({
    permissions,
    workspace,
    saving,
    resetting,
    onSubjectChange,
    onRetryWorkspace,
    onSave,
    onReset,
  })
  const navigation = useUnsavedPersonalNavigation({
    dirty: editor.isDirty,
    busy: editor.busy,
    onModeChange,
    onRoleChange,
    onSubjectChange,
  })

  async function saveBeforeContinuing() {
    if (await editor.saveDraft()) navigation.completeIntent()
  }

  return (
    <>
      <AccessControlModeTabs
        value={activeMode}
        disabled={editor.busy}
        onChange={(mode) => navigation.requestIntent({ type: 'mode', mode })}
      />

      <PermissionSubjectSelector
        roles={roles}
        roleId={roleId}
        subjects={subjects}
        selectedSubject={selectedSubject}
        subjectId={subjectId}
        searchText={subjectSearch}
        loading={subjectsLoading}
        disabled={editor.busy}
        page={subjectPage}
        pageSize={subjectPageSize}
        totalCount={subjectTotalCount}
        onRoleChange={(nextRoleId) =>
          navigation.requestIntent({ type: 'role', roleId: nextRoleId })
        }
        onSubjectChange={(userId) => navigation.requestIntent({ type: 'subject', userId })}
        onSearchChange={onSubjectSearchChange}
        onPageChange={onSubjectPageChange}
      />

      {subjectsError && !subjectId ? (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Không thể tải danh sách nhân sự</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            {getApiErrorMessage(subjectsError)}
            <Button type="button" variant="outline" size="sm" onClick={onRetrySubjects}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : !subjectId && !subjectsLoading && subjectTotalCount === 0 ? (
        <Empty className="border-border min-h-72 flex-1 rounded-md border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserRoundSearch aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>
              {subjectSearch.trim() ? 'Không tìm thấy nhân sự phù hợp' : 'Không có nhân sự phù hợp'}
            </EmptyTitle>
            <EmptyDescription>
              {subjectSearch.trim()
                ? 'Thử tìm bằng tên hoặc email khác.'
                : 'Vai trò đã chọn chưa có nhân sự đang hoạt động để phân quyền.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : !subjectId ? (
        <Empty className="border-border min-h-72 flex-1 rounded-md border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserRoundSearch aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Chọn nhân sự để cấu hình</EmptyTitle>
            <EmptyDescription>
              Tìm một Quản lý kho hoặc Nhân viên kho đang hoạt động. Quyền cá nhân không thay đổi
              phạm vi kho được giao.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : workspaceLoading ? (
        <div className="border-border bg-card flex min-h-0 flex-1 flex-col gap-3 rounded-md border p-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
          <Separator />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : workspaceError || !workspace ? (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Không thể tải quyền cá nhân</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            {workspaceError
              ? getPersonalPermissionErrorDetails(workspaceError).message
              : 'Không tìm thấy dữ liệu quyền của nhân sự.'}
            <Button type="button" variant="outline" size="sm" onClick={onRetryWorkspace}>
              Tải lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <PersonalPermissionEditor
          workspace={workspace}
          groups={editor.filteredGroups}
          draftIds={editor.draftIds}
          roleDefaultIds={editor.roleDefaultIds}
          customizedCount={editor.customizedIds.size}
          unsavedChangeCount={editor.unsavedChangeCount}
          searchText={editor.permissionSearch}
          filter={editor.filter}
          openModules={editor.visibleOpenModules}
          dirty={editor.isDirty}
          busy={editor.editorBlocked}
          saving={saving}
          mutationError={editor.mutationError}
          recovery={editor.recovery}
          onSearchChange={editor.setPermissionSearch}
          onFilterChange={editor.setFilter}
          onOpenModulesChange={editor.changeOpenModules}
          onTogglePermission={editor.togglePermission}
          onToggleModule={editor.toggleModule}
          onRequestReset={() => editor.setResetDialogOpen(true)}
          onRecover={() =>
            editor.recovery === 'reselect'
              ? editor.reselectSubject()
              : void editor.reloadWorkspace()
          }
          onDiscard={editor.discardDraft}
          onSave={() => void editor.saveDraft()}
        />
      )}

      <UnsavedChangesDialog
        open={navigation.dialogOpen}
        saving={saving}
        saveDisabled={editor.recovery !== null}
        onOpenChange={navigation.changeDialogOpen}
        onSave={() => void saveBeforeContinuing()}
        onDiscard={() => navigation.completeIntent()}
      />

      <ResetUserPermissionsDialog
        open={editor.resetDialogOpen}
        name={workspace?.subject.fullName ?? ''}
        role={
          getTenantRoleContent(workspace?.subject.roleName ?? selectedRole?.roleName ?? '').label
        }
        pending={resetting}
        onOpenChange={editor.setResetDialogOpen}
        onConfirm={() => void editor.resetPermissions()}
      />
    </>
  )
}
