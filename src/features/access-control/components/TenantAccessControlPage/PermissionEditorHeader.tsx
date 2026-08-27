import { ChevronsUp, RotateCcw, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PermissionSearch } from './PermissionSearch'

interface PermissionEditorHeaderProps {
  roleLabel: string
  roleDescription: string
  directCount: number
  effectiveCount: number
  moduleCount: number
  searchText: string
  dirty: boolean
  pending: boolean
  canCollapse: boolean
  onSearchChange: (value: string) => void
  onCollapseAll: () => void
  onDiscard: () => void
  onSave: () => void
}

export function PermissionEditorHeader({
  roleLabel,
  roleDescription,
  directCount,
  effectiveCount,
  moduleCount,
  searchText,
  dirty,
  pending,
  canCollapse,
  onSearchChange,
  onCollapseAll,
  onDiscard,
  onSave,
}: PermissionEditorHeaderProps) {
  return (
    <div className="border-border bg-card shrink-0 border-b">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-muted-foreground text-xs font-medium">Quyền truy cập</p>
            {dirty && <Badge variant="secondary">Chưa lưu</Badge>}
          </div>
          <h2 id="role-heading" className="text-foreground mt-1 text-lg font-semibold">
            {roleLabel}
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-xs leading-5">
            {roleDescription}
          </p>

          <dl className="mt-3 grid max-w-md grid-cols-3 divide-x">
            <div className="pr-3">
              <dt className="text-muted-foreground text-[11px]">Trực tiếp</dt>
              <dd className="text-foreground mt-0.5 text-sm font-semibold tabular-nums">
                {directCount}
              </dd>
            </div>
            <div className="px-3">
              <dt className="text-muted-foreground text-[11px]">Hiệu lực</dt>
              <dd className="text-foreground mt-0.5 text-sm font-semibold tabular-nums">
                {effectiveCount}
              </dd>
            </div>
            <div className="pl-3">
              <dt className="text-muted-foreground text-[11px]">Phân hệ</dt>
              <dd className="text-foreground mt-0.5 text-sm font-semibold tabular-nums">
                {moduleCount}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {dirty && (
            <Button type="button" variant="outline" disabled={pending} onClick={onDiscard}>
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
              Bỏ thay đổi
            </Button>
          )}
          <Button type="button" disabled={!dirty || pending} onClick={onSave}>
            {pending ? (
              <Spinner data-icon="inline-start" aria-hidden="true" />
            ) : (
              <Save data-icon="inline-start" aria-hidden="true" />
            )}
            {pending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>

      <div className="border-border bg-muted/20 flex items-center gap-2 border-t px-4 py-2.5">
        <PermissionSearch value={searchText} onChange={onSearchChange} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Thu gọn tất cả phân hệ"
              disabled={!canCollapse}
              onClick={onCollapseAll}
            >
              <ChevronsUp aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Thu gọn tất cả</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
