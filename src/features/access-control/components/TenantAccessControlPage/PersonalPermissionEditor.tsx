import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import type {
  PermissionModuleGroup,
  PersonalPermissionFilter,
  TenantUserPermissionWorkspace,
} from '../../types/tenant-access-control.types'
import type { PersonalPermissionRecovery } from '../../utils/tenant-user-permission-error'
import { PermissionCatalog } from './PermissionCatalog'
import { PermissionCustomizationFilter } from './PermissionCustomizationFilter'
import { PermissionSearch } from './PermissionSearch'
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
  readonly openModules: string[]
  readonly dirty: boolean
  readonly busy: boolean
  readonly saving: boolean
  readonly mutationError: string | null
  readonly recovery: PersonalPermissionRecovery | null
  readonly onSearchChange: (value: string) => void
  readonly onFilterChange: (filter: PersonalPermissionFilter) => void
  readonly onOpenModulesChange: (modules: string[]) => void
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
  openModules,
  dirty,
  busy,
  saving,
  mutationError,
  recovery,
  onSearchChange,
  onFilterChange,
  onOpenModulesChange,
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

      <div className="border-border flex shrink-0 flex-col gap-3 border-b px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold">Quyền hiệu lực</h2>
              {dirty && <Badge variant="secondary">{unsavedChangeCount} thay đổi chưa lưu</Badge>}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Quyền cá nhân chỉ ghi đè những mục khác với vai trò.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy || customizedCount === 0}
              onClick={onRequestReset}
            >
              Khôi phục quyền mặc định
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

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <PermissionSearch value={searchText} onChange={onSearchChange} />
          <PermissionCustomizationFilter value={filter} onChange={onFilterChange} />
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

      <ScrollArea className="bg-muted/10 min-h-0 flex-1">
        <div className="p-3 sm:p-4">
          <PermissionCatalog
            groups={groups}
            context={{
              kind: 'personal',
              subjectId: workspace.subject.userId,
              roleName: workspace.subject.roleName,
              selectedIds: draftIds,
              roleDefaultIds,
            }}
            openModules={openModules}
            disabled={busy}
            hasSearch={Boolean(searchText.trim()) || filter === 'customized'}
            emptyTitle={filter === 'customized' ? 'Không có quyền tùy chỉnh' : undefined}
            emptyDescription={
              filter === 'customized'
                ? 'Nhân sự đang dùng đúng quyền mặc định theo vai trò trong phạm vi tìm kiếm.'
                : undefined
            }
            onOpenModulesChange={onOpenModulesChange}
            onTogglePermission={onTogglePermission}
            onToggleModule={onToggleModule}
          />
          {filter === 'customized' && groups.length === 0 && (
            <Button
              type="button"
              variant="link"
              className="mx-auto mt-2 flex"
              onClick={() => onFilterChange('all')}
            >
              Xem tất cả quyền
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
