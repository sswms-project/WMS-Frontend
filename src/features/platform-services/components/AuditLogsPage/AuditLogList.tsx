import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người thực hiện</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Đối tượng</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead className="w-12">
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
    <TableRow>
      <TableCell className="text-xs whitespace-nowrap">
        {formatPlatformDateTime(log.createdAt)}
      </TableCell>
      <TableCell>
        <p className="text-sm font-medium">{log.actorName}</p>
        <p className="text-muted-foreground text-xs">{log.actorEmail}</p>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{log.action}</Badge>
      </TableCell>
      <TableCell>
        <p className="text-sm">{log.entityType}</p>
        <p className="text-muted-foreground max-w-40 truncate font-mono text-xs">{log.entityId}</p>
      </TableCell>
      <TableCell className="max-w-64 truncate text-sm">{log.reason ?? '—'}</TableCell>
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
          <Badge variant="outline">{log.action}</Badge>
          <p className="mt-2 text-sm font-medium">{log.actorName}</p>
          <p className="text-muted-foreground text-xs">{log.actorEmail}</p>
        </div>
        <ViewButton log={log} onView={onView} />
      </div>
      <p className="text-sm">{log.entityType}</p>
      <p className="text-muted-foreground text-xs">{formatPlatformDateTime(log.createdAt)}</p>
      {log.reason ? <p className="text-sm">Lý do: {log.reason}</p> : null}
    </li>
  )
}

function ViewButton({ log, onView }: AuditItemProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={`Xem chi tiết ${log.action}`}
      onClick={() => onView(log)}
    >
      <Eye aria-hidden="true" />
    </Button>
  )
}
