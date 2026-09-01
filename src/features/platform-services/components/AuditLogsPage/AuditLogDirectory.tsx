'use client'

import { useState } from 'react'
import { Eye, FileSearch, RefreshCw, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AuditLogItem } from '../../types/platform-services.types'
import { formatAuditValue, formatPlatformDateTime } from '../../utils/platform-services-format'
import { PaginationControls } from '../shared/PaginationControls'

export interface AuditLogFilterValues {
  readonly search: string
  readonly action: string
  readonly entityType: string
  readonly entityId: string
  readonly userId: string
  readonly dateFrom: string
  readonly dateTo: string
}

interface AuditLogDirectoryProps {
  readonly items: AuditLogItem[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly filters: AuditLogFilterValues
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly hasActiveFilters: boolean
  readonly onApplyFilters: (filters: AuditLogFilterValues) => void
  readonly onClearFilters: () => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
}

export function AuditLogDirectory(props: AuditLogDirectoryProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null)
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3" aria-labelledby="audit-title">
      <div>
        <h2 id="audit-title" className="text-xl font-semibold">
          Audit Log
        </h2>
        <p className="text-muted-foreground text-sm">
          Tra cứu lịch sử các hành động nghiệp vụ quan trọng.
        </p>
      </div>
      <AuditLogFilters
        filters={props.filters}
        onApply={props.onApplyFilters}
        onClear={props.onClearFilters}
      />
      <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Nhật ký hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
          {props.isLoading ? <AuditLoadingState /> : null}
          {props.isError ? <AuditErrorState onRetry={props.onRetry} /> : null}
          {!props.isLoading && !props.isError && props.items.length === 0 ? (
            <AuditEmptyState hasActiveFilters={props.hasActiveFilters} />
          ) : null}
          {!props.isLoading && !props.isError && props.items.length > 0 ? (
            <>
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
                      <AuditTableRow key={log.id} log={log} onView={setSelectedLog} />
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ul className="divide-y md:hidden">
                {props.items.map((log) => (
                  <AuditMobileCard key={log.id} log={log} onView={setSelectedLog} />
                ))}
              </ul>
            </>
          ) : null}
        </CardContent>
        {!props.isLoading && !props.isError && props.totalCount > 0 ? (
          <PaginationControls
            page={props.page}
            pageSize={props.pageSize}
            totalCount={props.totalCount}
            isFetching={props.isFetching}
            onPageChange={props.onPageChange}
          />
        ) : null}
      </Card>
      <AuditLogDetailSheet
        log={selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null)
        }}
      />
    </section>
  )
}

function AuditLogFilters({
  filters,
  onApply,
  onClear,
}: {
  readonly filters: AuditLogFilterValues
  readonly onApply: (filters: AuditLogFilterValues) => void
  readonly onClear: () => void
}) {
  return (
    <form
      key={JSON.stringify(filters)}
      className="bg-card grid gap-3 rounded-md border p-3 sm:grid-cols-2 xl:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        onApply({
          search: String(data.get('search') ?? ''),
          action: String(data.get('action') ?? ''),
          entityType: String(data.get('entityType') ?? ''),
          entityId: String(data.get('entityId') ?? ''),
          userId: String(data.get('userId') ?? ''),
          dateFrom: String(data.get('dateFrom') ?? ''),
          dateTo: String(data.get('dateTo') ?? ''),
        })
      }}
    >
      <FilterInput
        id="audit-search"
        name="search"
        label="Tìm kiếm"
        value={filters.search}
        placeholder="Ví dụ: phê duyệt đơn mua…"
      />
      <FilterInput
        id="audit-action"
        name="action"
        label="Hành động"
        value={filters.action}
        placeholder="Ví dụ: ApprovePurchaseOrder…"
      />
      <FilterInput
        id="audit-entity-type"
        name="entityType"
        label="Loại đối tượng"
        value={filters.entityType}
        placeholder="Ví dụ: PurchaseOrder…"
      />
      <FilterInput
        id="audit-user-id"
        name="userId"
        label="Actor ID"
        value={filters.userId}
        placeholder="UUID người thực hiện…"
      />
      <FilterInput
        id="audit-entity-id"
        name="entityId"
        label="Entity ID"
        value={filters.entityId}
        placeholder="UUID đối tượng…"
      />
      <FilterInput
        id="audit-from"
        name="dateFrom"
        label="Từ ngày"
        value={filters.dateFrom}
        type="date"
      />
      <FilterInput
        id="audit-to"
        name="dateTo"
        label="Đến ngày"
        value={filters.dateTo}
        type="date"
      />
      <div className="flex items-end gap-2">
        <Button type="submit">
          <Search data-icon="inline-start" aria-hidden="true" />
          Áp dụng
        </Button>
        <Button type="button" variant="ghost" onClick={onClear}>
          Xóa lọc
        </Button>
      </div>
    </form>
  )
}

function FilterInput({
  id,
  name,
  label,
  value,
  placeholder,
  type = 'text',
}: {
  readonly id: string
  readonly name: string
  readonly label: string
  readonly value: string
  readonly placeholder?: string
  readonly type?: string
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  )
}
function AuditTableRow({
  log,
  onView,
}: {
  readonly log: AuditLogItem
  readonly onView: (log: AuditLogItem) => void
}) {
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
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Xem chi tiết ${log.action}`}
          onClick={() => onView(log)}
        >
          <Eye aria-hidden="true" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
function AuditMobileCard({
  log,
  onView,
}: {
  readonly log: AuditLogItem
  readonly onView: (log: AuditLogItem) => void
}) {
  return (
    <li className="space-y-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Badge variant="outline">{log.action}</Badge>
          <p className="mt-2 text-sm font-medium">{log.actorName}</p>
          <p className="text-muted-foreground text-xs">{log.actorEmail}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Xem chi tiết"
          onClick={() => onView(log)}
        >
          <Eye aria-hidden="true" />
        </Button>
      </div>
      <p className="text-sm">{log.entityType}</p>
      <p className="text-muted-foreground text-xs">{formatPlatformDateTime(log.createdAt)}</p>
      {log.reason ? <p className="text-sm">Lý do: {log.reason}</p> : null}
    </li>
  )
}
function AuditLogDetailSheet({
  log,
  onOpenChange,
}: {
  readonly log: AuditLogItem | null
  readonly onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={log !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto overscroll-contain sm:max-w-xl">
        {log ? (
          <>
            <SheetHeader>
              <SheetTitle>Chi tiết Audit Log</SheetTitle>
              <SheetDescription>
                {log.action} · {formatPlatformDateTime(log.createdAt)}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 px-4 pb-6">
              <Detail label="Người thực hiện" value={`${log.actorName} (${log.actorEmail})`} />
              <Detail label="Đối tượng" value={`${log.entityType} · ${log.entityId}`} />
              <Detail label="Mô tả" value={log.description} />
              <Detail label="Lý do" value={log.reason ?? 'Không có'} />
              <AuditValue label="Trước thay đổi" value={log.oldValue} />
              <AuditValue label="Sau thay đổi" value={log.newValue} />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
function Detail({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold uppercase">{label}</p>
      <p className="mt-1 text-sm break-words">{value}</p>
    </div>
  )
}
function AuditValue({ label, value }: { readonly label: string; readonly value: string | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-semibold uppercase">{label}</p>
      <pre className="bg-muted mt-1 max-h-64 overflow-auto rounded-md p-3 text-xs break-words whitespace-pre-wrap">
        {formatAuditValue(value)}
      </pre>
    </div>
  )
}
function AuditLoadingState() {
  return (
    <div className="space-y-3 p-4" role="status">
      <span className="sr-only">Đang tải Audit Log</span>
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </div>
  )
}
function AuditErrorState({ onRetry }: { readonly onRetry: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6" role="alert">
      <p>Không thể tải Audit Log.</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        <RefreshCw data-icon="inline-start" aria-hidden="true" />
        Thử lại
      </Button>
    </div>
  )
}
function AuditEmptyState({ hasActiveFilters }: { readonly hasActiveFilters: boolean }) {
  return (
    <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center">
      <FileSearch className="size-8" aria-hidden="true" />
      <p className="text-sm">
        {hasActiveFilters ? 'Không có bản ghi phù hợp bộ lọc.' : 'Chưa có bản ghi Audit Log.'}
      </p>
    </div>
  )
}
