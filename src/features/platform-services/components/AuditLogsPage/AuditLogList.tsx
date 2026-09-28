import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AuditLogItem } from '../../types/platform-services.types'
import { formatPlatformDateTime } from '../../utils/platform-services-format'
import { AuditEmptyState, AuditErrorState, AuditLoadingState } from './AuditLogStates'

interface AuditLogListProps {
  readonly items: AuditLogItem[]
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly hasActiveFilters: boolean
  readonly onView: (log: AuditLogItem) => void
  readonly onRetry: () => void
}

export function AuditLogList(props: AuditLogListProps) {
  if (props.isLoading) return <AuditLoadingState />
  if (props.isError) return <AuditErrorState onRetry={props.onRetry} />
  if (props.items.length === 0) return <AuditEmptyState hasActiveFilters={props.hasActiveFilters} />
  return (
    <div aria-busy={props.isFetching}>
      <div className="hidden min-w-0 md:block">
        <Table>
          <TableHeader className="bg-card">
            <TableRow>
              <TableHead className="bg-card sticky top-0 z-10">Người dùng</TableHead>
              <TableHead className="bg-card sticky top-0 z-10">Thời gian</TableHead>
              <TableHead className="bg-card sticky top-0 z-10">Đối tượng thao tác</TableHead>
              <TableHead className="bg-card sticky top-0 z-10">Hành động</TableHead>
              <TableHead className="bg-card sticky top-0 z-10">Tham chiếu</TableHead>
              <TableHead className="bg-card sticky top-0 z-10">Mô tả chi tiết</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 w-12">
                <span className="sr-only">Chi tiết</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.items.map((log) => (
              <AuditTableRow key={log.id} log={log} onView={props.onView} />
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="divide-y md:hidden">
        {props.items.map((log) => (
          <AuditMobileCard key={log.id} log={log} onView={props.onView} />
        ))}
      </ul>
    </div>
  )
}

interface AuditItemProps {
  readonly log: AuditLogItem
  readonly onView: (log: AuditLogItem) => void
}

function AuditTableRow({ log, onView }: AuditItemProps) {
  return (
    <TableRow
      tabIndex={0}
      className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
      aria-label={`Xem chi tiết ${log.actionLabel}: ${log.referenceDisplay}`}
      onClick={(event) => {
        event.currentTarget.focus()
        onView(log)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onView(log)
        }
      }}
    >
      <TableCell>
        <p className="text-sm font-medium">{log.actorName}</p>
        <p className="text-muted-foreground text-xs">{log.actorEmail}</p>
      </TableCell>
      <TableCell className="text-xs whitespace-nowrap">
        {formatPlatformDateTime(log.createdAt)}
      </TableCell>
      <TableCell>
        <p className="text-sm">{log.entityTypeLabel}</p>
      </TableCell>
      <TableCell className="text-sm">{log.actionLabel}</TableCell>
      <TableCell className="max-w-56">
        <EmailAwareDisplay value={log.referenceDisplay} />
      </TableCell>
      <TableCell className="max-w-80">
        <EmailAwareDisplay value={log.summary} emphasizeLabel={false} />
      </TableCell>
      <TableCell>
        <ViewButton log={log} onView={onView} />
      </TableCell>
    </TableRow>
  )
}

function AuditMobileCard({ log, onView }: AuditItemProps) {
  return (
    <li className="space-y-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{log.actorName}</p>
          <p className="text-muted-foreground text-xs">{log.actorEmail}</p>
        </div>
        <ViewButton log={log} onView={onView} />
      </div>
      <p className="text-sm">
        {log.actionLabel} · {log.entityTypeLabel}
      </p>
      <EmailAwareDisplay value={log.referenceDisplay} />
      <p className="text-muted-foreground text-xs">{formatPlatformDateTime(log.createdAt)}</p>
      <EmailAwareDisplay value={log.summary} emphasizeLabel={false} />
    </li>
  )
}

function EmailAwareDisplay({
  value,
  emphasizeLabel = true,
}: {
  readonly value: string
  readonly emphasizeLabel?: boolean
}) {
  const separatorIndex = value.lastIndexOf(' · ')
  const label = separatorIndex === -1 ? value : value.slice(0, separatorIndex)
  const detail = separatorIndex === -1 ? '' : value.slice(separatorIndex + 3)

  if (!detail.includes('@')) {
    return <p className="text-sm break-words">{value}</p>
  }

  return (
    <div className="min-w-0">
      <p className={emphasizeLabel ? 'text-sm font-medium break-words' : 'text-sm break-words'}>
        {label}
      </p>
      <p className="text-muted-foreground text-xs break-all">{detail}</p>
    </div>
  )
}

function ViewButton({ log, onView }: AuditItemProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Xem chi tiết ${log.actionLabel}`}
      onClick={() => onView(log)}
    >
      <Eye aria-hidden="true" />
    </Button>
  )
}
