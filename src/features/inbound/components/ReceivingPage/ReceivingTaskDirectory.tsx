import { PackagePlus, RefreshCw, Search, UserCheck, UserRoundCog } from 'lucide-react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { Button } from '@/components/ui/button'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ReceivingTask } from '../../types/inbound.types'
import { TaskAssigneeCell } from '../TaskAssignment'
import {
  formatOperationalDate,
  formatQuantity,
} from '@/features/inbound-request/utils/inbound-request-format'

interface ReceivingTaskDirectoryProps {
  readonly items: readonly ReceivingTask[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly searchText: string
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly onSearchChange: (value: string) => void
  readonly onPageChange: (page: number) => void
  readonly onPageSizeChange: (pageSize: number) => void
  readonly onReceive: (task: ReceivingTask) => void
  readonly onImportDocument: (task: ReceivingTask) => void
  readonly onRetry: () => void
  readonly currentUserId: string | null
  readonly canAssign: boolean
  readonly assignmentFilter: ReceivingAssignmentFilter
  readonly onAssignmentFilterChange: (filter: ReceivingAssignmentFilter) => void
  readonly onAssign: (task: ReceivingTask) => void
}

export type ReceivingAssignmentFilter = 'all' | 'unassigned'

export function ReceivingTaskDirectory({
  items,
  totalCount,
  page,
  pageSize,
  searchText,
  isLoading,
  isFetching,
  isError,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onReceive,
  onImportDocument,
  onRetry,
  currentUserId,
  canAssign,
  assignmentFilter,
  onAssignmentFilterChange,
  onAssign,
}: ReceivingTaskDirectoryProps) {
  function renderActions(item: ReceivingTask, layout: 'row' | 'stack') {
    const isMine = Boolean(currentUserId) && item.assignedTo === currentUserId
    return (
      <div className={layout === 'row' ? 'flex justify-end gap-2' : 'flex shrink-0 flex-col gap-1'}>
        {canAssign && (
          <Button
            type="button"
            size="sm"
            variant={item.assignedTo ? 'outline' : 'default'}
            onClick={() => onAssign(item)}
          >
            {item.assignedTo ? (
              <UserRoundCog aria-hidden="true" />
            ) : (
              <UserCheck aria-hidden="true" />
            )}
            {item.assignedTo ? 'Giao lại' : 'Giao việc'}
          </Button>
        )}
        {isMine && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onImportDocument(item)}
            >
              {item.activeDocumentImportId ? 'Tiếp tục chứng từ' : 'Nhập từ chứng từ'}
            </Button>
            <Button type="button" size="sm" onClick={() => onReceive(item)}>
              <PackagePlus aria-hidden="true" />
              Nhập thủ công
            </Button>
          </>
        )}
        {!canAssign && !isMine && (
          <span className="text-muted-foreground text-xs">Chờ quản lý giao việc</span>
        )}
      </div>
    )
  }

  return (
    <OperationalListPanel aria-label="Đơn chờ nhận hàng">
      <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Đơn chờ nhận hàng</h2>
          <p className="text-muted-foreground text-xs tabular-nums">{totalCount} đơn đang mở</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAssign && (
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={assignmentFilter}
              onValueChange={(value) =>
                value && onAssignmentFilterChange(value as ReceivingAssignmentFilter)
              }
              aria-label="Lọc theo phân công"
            >
              <ToggleGroupItem value="all">Tất cả</ToggleGroupItem>
              <ToggleGroupItem value="unassigned">Chưa giao</ToggleGroupItem>
            </ToggleGroup>
          )}
          <InputGroup className="min-w-0 flex-1 sm:w-72">
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Tìm đơn chờ nhận"
              placeholder="Tìm mã PO, nhà cung cấp…"
              value={searchText}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Tải lại"
                onClick={onRetry}
              >
                <RefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tải lại</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {isLoading ? (
        <OperationalLoadingState />
      ) : isError ? (
        <OperationalErrorState title="Không thể tải danh sách chờ nhận" onRetry={onRetry} />
      ) : items.length === 0 ? (
        <OperationalEmptyState
          title="Không có đơn chờ nhận"
          description={
            canAssign
              ? assignmentFilter === 'unassigned'
                ? 'Mọi đơn chờ nhận đều đã được giao cho nhân viên.'
                : 'Các yêu cầu nhập kho đã duyệt và còn số lượng sẽ xuất hiện tại đây.'
              : 'Các đơn nhận hàng được quản lý giao cho bạn sẽ xuất hiện tại đây.'
          }
        />
      ) : (
        <>
          <ItemGroup className="gap-0 md:hidden">
            {items.map((item) => (
              <Item key={item.inboundRequestId} className="border-b last:border-b-0">
                <ItemContent>
                  <ItemTitle className="font-mono" translate="no">
                    {item.inboundRequestCode}
                  </ItemTitle>
                  <ItemDescription>
                    {item.supplierName} · {item.warehouseName}
                  </ItemDescription>
                  <ItemDescription>
                    {formatQuantity(item.remainingQuantity)} còn nhận ·{' '}
                    {formatOperationalDate(item.expectedDate)}
                  </ItemDescription>
                  <div className="mt-1">
                    <TaskAssigneeCell
                      assigneeName={item.assignedToName}
                      executionStatus={item.executionStatus}
                      isCurrentUser={Boolean(currentUserId) && item.assignedTo === currentUserId}
                    />
                  </div>
                </ItemContent>
                {renderActions(item, 'stack')}
              </Item>
            ))}
          </ItemGroup>
          <div className="hidden min-h-0 flex-1 overflow-auto md:block">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-10">Mã PO</TableHead>
                  <TableHead className="sticky top-0 z-10">Nhà cung cấp</TableHead>
                  <TableHead className="sticky top-0 z-10">Kho nhận</TableHead>
                  <TableHead className="sticky top-0 z-10 text-right">Đã nhận / Đặt</TableHead>
                  <TableHead className="sticky top-0 z-10">Ngày dự kiến</TableHead>
                  <TableHead className="sticky top-0 z-10">Người nhận việc</TableHead>
                  <TableHead className="sticky top-0 z-10 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.inboundRequestId}>
                    <TableCell className="font-mono font-semibold" translate="no">
                      {item.inboundRequestCode}
                    </TableCell>
                    <TableCell>{item.supplierName}</TableCell>
                    <TableCell>{item.warehouseName}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatQuantity(item.receivedQuantity)} /{' '}
                      {formatQuantity(item.orderedQuantity)}
                    </TableCell>
                    <TableCell>{formatOperationalDate(item.expectedDate)}</TableCell>
                    <TableCell className="max-w-48">
                      <TaskAssigneeCell
                        assigneeName={item.assignedToName}
                        executionStatus={item.executionStatus}
                        isCurrentUser={Boolean(currentUserId) && item.assignedTo === currentUserId}
                      />
                    </TableCell>
                    <TableCell className="text-right">{renderActions(item, 'row')}</TableCell>
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
