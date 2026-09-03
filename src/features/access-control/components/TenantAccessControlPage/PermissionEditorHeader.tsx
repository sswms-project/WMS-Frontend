import { ChevronsUp, RotateCcw, Save } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PermissionSearch } from './PermissionSearch'

interface PermissionEditorHeaderProps {
  readonly roleLabel: string
  readonly roleDescription: string
  readonly directCount: number
  readonly effectiveCount: number
  readonly moduleCount: number
  readonly searchText: string
  readonly dirty: boolean
  readonly pending: boolean
  readonly canCollapse: boolean
  readonly onSearchChange: (value: string) => void
  readonly onCollapseAll: () => void
  readonly onDiscard: () => void
  readonly onSave: () => void
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
      <div className="flex flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="role-heading" className="text-foreground text-base font-semibold text-pretty">
              {roleLabel}
            </h2>
            {dirty && <Badge variant="secondary">Chưa lưu</Badge>}
          </div>
          <p className="text-muted-foreground mt-0.5 max-w-2xl text-xs leading-5 text-pretty">
            {roleDescription}
          </p>
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

      <div className="border-border bg-muted/20 flex flex-col gap-2 border-t px-3 py-2.5 sm:flex-row sm:items-center sm:px-4">
        <dl className="flex shrink-0 items-center divide-x text-xs">
          <div className="flex items-baseline gap-1.5 pr-3">
            <dt className="text-muted-foreground">Trực tiếp</dt>
            <dd className="text-foreground font-semibold tabular-nums">{directCount}</dd>
          </div>
          <div className="flex items-baseline gap-1.5 px-3">
            <dt className="text-muted-foreground">Hiệu lực</dt>
            <dd className="text-foreground font-semibold tabular-nums">{effectiveCount}</dd>
          </div>
          <div className="flex items-baseline gap-1.5 px-3">
            <dt className="text-muted-foreground">Phân hệ</dt>
            <dd className="text-foreground font-semibold tabular-nums">{moduleCount}</dd>
          </div>
        </dl>
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
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
