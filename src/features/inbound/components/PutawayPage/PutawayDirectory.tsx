import {
  ArrowRight,
  Eye,
  PackageCheck,
  RefreshCw,
  Search,
  UserCheck,
  UserRoundCog,
} from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  formatOperationalDateTime,
  formatQuantity,
} from '@/features/inbound-request/utils/inbound-request-format'
import type { GoodsReceiptSummary } from '../../types/inbound.types'
import { TaskAssigneeCell } from '../TaskAssignment'

export type PutawayAssignmentFilter = 'all' | 'unassigned'

interface PutawayDirectoryProps {
  readonly items: readonly GoodsReceiptSummary[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly createdFrom: string
  readonly createdTo: string
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onCreatedFromChange: (value: string) => void
  readonly onCreatedToChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
  readonly onRetry: () => void
  readonly currentUserId: string | null
  readonly canAssign: boolean
  readonly assignmentFilter: PutawayAssignmentFilter
  readonly onAssignmentFilterChange: (filter: PutawayAssignmentFilter) => void
  readonly onAssign: (receipt: GoodsReceiptSummary) => void
}

function remainingQuantity(item: GoodsReceiptSummary) {
  return Math.max(0, item.receivedQuantity - item.damagedQuantity - item.putAwayQuantity)
}

export function PutawayDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  createdFrom,
  createdTo,
  isLoading,
  isFetching,
  isError,
  onSearchChange,
  onCreatedFromChange,
  onCreatedToChange,
  onPageChange,
  onPageSizeChange,
  onRetry,
  currentUserId,
  canAssign,
  assignmentFilter,
  onAssignmentFilterChange,
  onAssign,
}: PutawayDirectoryProps) {
  function renderActions(item: GoodsReceiptSummary, compact: boolean) {
    const isMine = Boolean(currentUserId) && item.putAwayAssignedTo === currentUserId
    return (
      <div className={compact ? 'flex shrink-0 flex-col gap-1' : 'flex justify-end gap-2'}>
        {canAssign && (
          <Button
            type="button"
            size="sm"
            variant={item.putAwayAssignedTo ? 'outline' : 'default'}
            onClick={() => onAssign(item)}
          >
            {item.putAwayAssignedTo ? (
              <UserRoundCog aria-hidden="true" />
            ) : (
              <UserCheck aria-hidden="true" />
            )}
            {item.putAwayAssignedTo ? 'Giao lại' : 'Giao việc'}
          </Button>
        )}
        {isMine ? (
          <Button asChild size="sm">
            <Link
              href={APP_ROUTES.inboundPutawayDetail(item.id) as Route}
              aria-label={`Cất hàng ${item.receiptCode}`}
            >
              Cất hàng
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : canAssign ? (
          <Button asChild size="sm" variant="ghost">
            <Link
              href={APP_ROUTES.inboundPutawayDetail(item.id) as Route}
              aria-label={`Xem tiến độ cất hàng ${item.receiptCode}`}
            >
              <Eye aria-hidden="true" />
              Xem
            </Link>
          </Button>
        ) : (
          <span className="text-muted-foreground text-xs">Chờ quản lý giao việc</span>
        )}
      </div>
    )
  }

  return (
    <OperationalListPanel aria-label="Danh sách chờ cất hàng">
      <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Phiếu chờ cất hàng</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAssign && (
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={assignmentFilter}
              onValueChange={(value) =>
                value && onAssignmentFilterChange(value as PutawayAssignmentFilter)
              }
              aria-label="Lọc theo phân công"
            >
              <ToggleGroupItem value="all">Tất cả</ToggleGroupItem>
              <ToggleGroupItem value="unassigned">Chưa giao</ToggleGroupItem>
            </ToggleGroup>
          )}
          <label className="text-muted-foreground flex items-center gap-2 text-xs">
            Tạo từ
            <Input
              type="date"
              aria-label="Lọc phiếu từ ngày tạo"
              className="w-36"
              value={createdFrom}
              max={createdTo || undefined}
              onChange={(event) => onCreatedFromChange(event.target.value)}
            />
          </label>
          <label className="text-muted-foreground flex items-center gap-2 text-xs">
            Đến
            <Input
              type="date"
              aria-label="Lọc phiếu đến ngày tạo"
              className="w-36"
              value={createdTo}
              min={createdFrom || undefined}
              onChange={(event) => onCreatedToChange(event.target.value)}
            />
          </label>
          <InputGroup className="min-w-0 flex-1 sm:w-72">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Tìm phiếu chờ cất"
              placeholder="Tìm mã phiếu, mã PO…"
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Tải lại"
            onClick={onRetry}
          >
            <RefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden="true" />
          </Button>
        </div>
      </div>
      {isLoading ? (
        <OperationalLoadingState />
      ) : isError ? (
        <OperationalErrorState title="Không thể tải danh sách chờ cất" onRetry={onRetry} />
      ) : items.length === 0 ? (
        <OperationalEmptyState
          title="Không có hàng chờ cất"
          description={
            canAssign
              ? assignmentFilter === 'unassigned'
                ? 'Mọi phiếu chờ cất đều đã được giao cho nhân viên.'
                : 'Phiếu đã duyệt và còn hàng khả dụng sẽ xuất hiện tại đây.'
              : 'Các phiếu cất hàng được quản lý giao cho bạn sẽ xuất hiện tại đây.'
          }
        />
      ) : (
        <>
          <ItemGroup className="gap-0 md:hidden">
            {items.map((item) => (
              <Item key={item.id} className="border-b last:border-b-0">
                <PackageCheck aria-hidden="true" />
                <ItemContent>
                  <ItemTitle className="font-mono">{item.receiptCode}</ItemTitle>
                  <ItemDescription>
                    {item.inboundRequestCode} · {item.warehouseName}
                  </ItemDescription>
                  <ItemDescription>
                    Tạo lúc {formatOperationalDateTime(item.createdAt)}
                  </ItemDescription>
                  <ItemDescription>
                    {formatQuantity(remainingQuantity(item))} còn cất
                  </ItemDescription>
                  <div className="mt-1">
                    <TaskAssigneeCell
                      assigneeName={item.putAwayAssignedToName}
                      executionStatus={item.putAwayExecutionStatus}
                      isCurrentUser={
                        Boolean(currentUserId) && item.putAwayAssignedTo === currentUserId
                      }
                    />
                  </div>
                </ItemContent>
                {renderActions(item, true)}
              </Item>
            ))}
          </ItemGroup>
          <div className="hidden min-h-0 flex-1 overflow-auto md:block">
            <Table className="min-w-[940px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-10">Mã phiếu</TableHead>
                  <TableHead className="sticky top-0 z-10">Yêu cầu nhập kho</TableHead>
                  <TableHead className="sticky top-0 z-10">Kho</TableHead>
                  <TableHead className="sticky top-0 z-10 text-right">Còn cất</TableHead>
                  <TableHead className="sticky top-0 z-10">Ngày tạo</TableHead>
                  <TableHead className="sticky top-0 z-10">Người cất hàng</TableHead>
                  <TableHead className="sticky top-0 z-10 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-semibold">{item.receiptCode}</TableCell>
                    <TableCell className="font-mono">{item.inboundRequestCode}</TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatQuantity(remainingQuantity(item))}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatOperationalDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-48">
                      <TaskAssigneeCell
                        assigneeName={item.putAwayAssignedToName}
                        executionStatus={item.putAwayExecutionStatus}
                        isCurrentUser={
                          Boolean(currentUserId) && item.putAwayAssignedTo === currentUserId
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">{renderActions(item, false)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <OperationalPagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            isPending={isFetching}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}
    </OperationalListPanel>
  )
}
