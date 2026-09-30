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
      <div className="hidden min-w-0 md:block [&>[data-slot=table-container]]:overflow-visible">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 z-10">Người dùng</TableHead>
              <TableHead className="sticky top-0 z-10">Thời gian</TableHead>
              <TableHead className="sticky top-0 z-10">Đối tượng thao tác</TableHead>
              <TableHead className="sticky top-0 z-10">Hành động</TableHead>
              <TableHead className="sticky top-0 z-10">Tham chiếu</TableHead>
              <TableHead className="sticky top-0 z-10">Mô tả chi tiết</TableHead>
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
      <TableCell className="max-w-56 whitespace-normal">
        <EmailAwareDisplay value={log.referenceDisplay} />
      </TableCell>
      <TableCell className="max-w-80 whitespace-normal">
        <EmailAwareDisplay value={log.summary} emphasizeLabel={false} />
      </TableCell>
    </TableRow>
  )
}

function AuditMobileCard({ log, onView }: AuditItemProps) {
  return (
    <li>
      <Button
        type="button"
        variant="ghost"
        className="h-auto w-full flex-col items-stretch gap-2 rounded-none p-4 text-left whitespace-normal"
        aria-label={`Xem chi tiết ${log.actionLabel}: ${log.referenceDisplay}`}
        onClick={() => onView(log)}
      >
        <span className="block">
          <span className="block text-sm font-medium">{log.actorName}</span>
          <span className="text-muted-foreground block text-xs">{log.actorEmail}</span>
        </span>
        <span className="block text-sm">
          {log.actionLabel} · {log.entityTypeLabel}
        </span>
        <EmailAwareDisplay value={log.referenceDisplay} />
        <span className="text-muted-foreground block text-xs">
          {formatPlatformDateTime(log.createdAt)}
        </span>
        <EmailAwareDisplay value={log.summary} emphasizeLabel={false} />
      </Button>
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
    return <span className="block text-sm break-words">{value}</span>
  }

  return (
    <span className="block min-w-0">
      <span
        className={
          emphasizeLabel ? 'block text-sm font-medium break-words' : 'block text-sm break-words'
        }
      >
        {label}
      </span>
      <span className="text-muted-foreground block text-xs break-all">{detail}</span>
    </span>
  )
}
