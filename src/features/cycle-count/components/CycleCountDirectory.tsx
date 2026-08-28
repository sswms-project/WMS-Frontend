'use client'

import Link from 'next/link'
import { ClipboardCheck, Eye, Plus, RefreshCw } from 'lucide-react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Button } from '@/components/ui/button'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { APP_ROUTES } from '@/routes/app-routes'
import { InventoryWorkspaceNavigation } from '@/features/inventory/components/InventoryWorkspaceNavigation'
import type { CycleCountStatus, CycleCountSummary } from '../types/cycle-count.types'
import { CYCLE_COUNT_STATUSES } from '../types/cycle-count.types'
import { formatCycleCountDate } from '../utils/cycle-count-format'
import { CycleCountStatusBadge } from './CycleCountStatusBadge'

interface Props {
  readonly permissions: readonly string[]
  readonly items: readonly CycleCountSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly warehouseId: string
  readonly status: '' | CycleCountStatus
  readonly warehouses: readonly { value: string; label: string }[]
  readonly canCreate: boolean
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onWarehouseChange: (value: string) => void
  readonly onStatusChange: (value: '' | CycleCountStatus) => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
}

export function CycleCountDirectory(props: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div className="flex items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center">
            <ClipboardCheck aria-hidden="true" />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Kiểm soát tồn kho</p>
            <h1 className="text-xl font-semibold">Kiểm kê định kỳ</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Theo dõi số đếm thực tế, đếm lại và chênh lệch tồn kho.
            </p>
          </div>
        </div>
        {props.canCreate ? (
          <Button asChild>
            <Link href={APP_ROUTES.cycleCountCreate}>
              <Plus aria-hidden="true" />
              Tạo phiếu kiểm kê
            </Link>
          </Button>
        ) : null}
      </header>
      <InventoryWorkspaceNavigation currentView="cycle-counts" permissions={props.permissions} />
      <section className="bg-card flex min-h-0 flex-1 flex-col border">
        <div className="flex flex-wrap items-end gap-3 border-b p-3">
          <label className="grid gap-1 text-xs font-medium">
            Kho
            <NativeSelect
              className="h-9 min-w-52"
              value={props.warehouseId}
              onChange={(e) => props.onWarehouseChange(e.target.value)}
            >
              <NativeSelectOption value="">Tất cả kho</NativeSelectOption>
              {props.warehouses.map((item) => (
                <NativeSelectOption key={item.value} value={item.value}>
                  {item.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label className="grid gap-1 text-xs font-medium">
            Trạng thái
            <NativeSelect
              className="h-9 min-w-44"
              value={props.status}
              onChange={(e) => props.onStatusChange(parseCycleCountStatus(e.target.value))}
            >
              <NativeSelectOption value="">Tất cả trạng thái</NativeSelectOption>
              {Object.values(CYCLE_COUNT_STATUSES).map((value) => (
                <NativeSelectOption key={value} value={value}>
                  {value}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <Button
            variant="outline"
            size="icon"
            aria-label="Làm mới"
            disabled={props.isFetching}
            onClick={props.onRetry}
          >
            <RefreshCw
              className={props.isFetching ? 'animate-spin motion-reduce:animate-none' : ''}
            />
          </Button>
        </div>
        {props.isLoading ? (
          <OperationalLoadingState rows={8} />
        ) : props.isError ? (
          <OperationalErrorState title="Không thể tải danh sách kiểm kê" onRetry={props.onRetry} />
        ) : props.items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có phiếu kiểm kê"
            description="Tạo phiếu mới hoặc thay đổi bộ lọc để xem dữ liệu."
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-auto">
            <Table className="min-w-[920px] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-card sticky top-0 w-64">Kho / Khu vực</TableHead>
                  <TableHead className="bg-card sticky top-0 w-44">Lịch kiểm kê</TableHead>
                  <TableHead className="bg-card sticky top-0 w-44">Phụ trách</TableHead>
                  <TableHead className="bg-card sticky top-0 w-36">Tiến độ</TableHead>
                  <TableHead className="bg-card sticky top-0 w-40">Trạng thái</TableHead>
                  <TableHead className="bg-card sticky top-0 w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {props.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.warehouseName}</p>
                      <p className="text-muted-foreground text-xs">
                        {item.zoneId ? 'Kiểm kê theo khu vực' : 'Toàn kho'} ·{' '}
                        {item.isBlindCount ? 'Blind count' : 'Hiện tồn hệ thống'}
                      </p>
                    </TableCell>
                    <TableCell>{formatCycleCountDate(item.scheduledDate)}</TableCell>
                    <TableCell>{item.assignedToName || 'Chưa phân công'}</TableCell>
                    <TableCell>
                      <p className="font-mono tabular-nums">
                        {item.countedItemCount}/{item.itemCount}
                      </p>
                      <div className="bg-muted mt-1 h-1.5">
                        <div
                          className="bg-primary h-full transition-[width] duration-300 motion-reduce:transition-none"
                          style={{
                            width: `${item.itemCount ? (item.countedItemCount / item.itemCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <CycleCountStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <Link aria-label="Xem chi tiết" href={APP_ROUTES.cycleCountDetail(item.id)}>
                          <Eye />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <OperationalPagination
          page={props.page}
          pageSize={props.pageSize}
          totalCount={props.totalCount}
          isPending={props.isFetching}
          onPageChange={props.onPageChange}
        />
      </section>
    </div>
  )
}

function parseCycleCountStatus(value: string): '' | CycleCountStatus {
  return Object.values(CYCLE_COUNT_STATUSES).find((status) => status === value) ?? ''
}
