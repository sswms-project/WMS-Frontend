import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type {
  PermissionModuleGroup,
  PersonalPermissionFilter,
  TenantUserPermissionWorkspace,
} from '../../types/tenant-access-control.types'
import type { PersonalPermissionRecovery } from '../../utils/tenant-user-permission-error'
import { PermissionCustomizationFilter } from './PermissionCustomizationFilter'
import { PermissionSearch } from './PermissionSearch'
import { PersonalPermissionCatalog } from './PersonalPermissionCatalog'
import { PermissionSubjectSummary } from './PermissionSubjectSummary'

interface PersonalPermissionEditorProps {
  readonly workspace: TenantUserPermissionWorkspace
  readonly groups: PermissionModuleGroup[]
  readonly draftIds: ReadonlySet<string>
  readonly roleDefaultIds: ReadonlySet<string>
  readonly customizedCount: number
  readonly unsavedChangeCount: number
  readonly searchText: string
  readonly filter: PersonalPermissionFilter
  readonly dirty: boolean
  readonly busy: boolean
  readonly saving: boolean
  readonly mutationError: string | null
  readonly recovery: PersonalPermissionRecovery | null
  readonly onSearchChange: (value: string) => void
  readonly onFilterChange: (filter: PersonalPermissionFilter) => void
  readonly onTogglePermission: (permissionId: string) => void
  readonly onToggleModule: (permissionIds: string[]) => void
  readonly onRequestReset: () => void
  readonly onRecover: () => void
  readonly onDiscard: () => void
  readonly onSave: () => void
}

export function PersonalPermissionEditor({
  workspace,
  groups,
  draftIds,
  roleDefaultIds,
  customizedCount,
  unsavedChangeCount,
  searchText,
  filter,
  dirty,
  busy,
  saving,
  mutationError,
  recovery,
  onSearchChange,
  onFilterChange,
  onTogglePermission,
  onToggleModule,
  onRequestReset,
  onRecover,
  onDiscard,
  onSave,
}: PersonalPermissionEditorProps) {
  return (
    <div className="border-border bg-card flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border">
      <PermissionSubjectSummary workspace={workspace} customizedCount={customizedCount} />

      <div className="border-border flex shrink-0 flex-col gap-2 border-b px-3 py-3 sm:px-4 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <PermissionSearch value={searchText} onChange={onSearchChange} />
          <PermissionCustomizationFilter value={filter} onChange={onFilterChange} />
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {dirty && <Badge variant="secondary">{unsavedChangeCount} chưa lưu</Badge>}
          <Button
            type="button"
            variant="outline"
            aria-label="Khôi phục quyền mặc định theo vai trò"
            disabled={busy || customizedCount === 0}
            onClick={onRequestReset}
          >
            Khôi phục mặc định
          </Button>
          {dirty && (
            <Button type="button" variant="outline" disabled={busy} onClick={onDiscard}>
              Bỏ thay đổi
            </Button>
          )}
          <Button type="button" disabled={!dirty || busy} onClick={onSave}>
            {saving && <Spinner data-icon="inline-start" aria-hidden="true" />}
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      {mutationError && (
        <Alert variant="destructive" className="m-3 mb-0 shrink-0 sm:mx-4">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Chưa thể cập nhật quyền</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            {mutationError}
            {recovery && (
              <Button type="button" variant="outline" size="sm" onClick={onRecover}>
                {recovery === 'reselect' ? 'Chọn lại nhân sự' : 'Bỏ thay đổi và tải lại'}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <PersonalPermissionCatalog
        groups={groups}
        subjectId={workspace.subject.userId}
        selectedIds={draftIds}
        roleDefaultIds={roleDefaultIds}
        disabled={busy}
        hasSearch={Boolean(searchText.trim()) || filter === 'customized'}
        emptyTitle={filter === 'customized' ? 'Không có quyền tùy chỉnh' : undefined}
        emptyDescription={
          filter === 'customized'
            ? 'Nhân sự đang dùng đúng quyền mặc định theo vai trò trong phạm vi tìm kiếm.'
            : undefined
        }
        onTogglePermission={onTogglePermission}
        onToggleModule={onToggleModule}
      />
      {filter === 'customized' && groups.length === 0 && (
        <Button
          type="button"
          variant="link"
          className="mx-auto mb-3 flex"
          onClick={() => onFilterChange('all')}
        >
          Xem tất cả quyền
        </Button>
      )}
    </div>
  )
}
