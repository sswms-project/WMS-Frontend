'use client'

import { History, ListFilter, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type {
  InventoryFilterOption,
  StockMovement,
  StockMovementType,
} from '../../types/inventory.types'
import { InventoryWorkspaceNavigation } from '../InventoryWorkspaceNavigation'
import { StockMovementFilters } from './StockMovementFilters'
import { StockMovementDesktopTable, StockMovementMobileList } from './StockMovementResults'

interface StockMovementHistoryProps {
  readonly items: readonly StockMovement[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly productId: string
  readonly movementType: StockMovementType | ''
  readonly dateFrom: string
  readonly dateTo: string
  readonly productOptions: readonly InventoryFilterOption[]
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly isDateRangeValid: boolean
  readonly areProductsLoading: boolean
  readonly areProductsError: boolean
  readonly activeFilterCount: number
  readonly onProductChange: (value: string) => void
  readonly onMovementTypeChange: (value: StockMovementType | '') => void
  readonly onDateFromChange: (value: string) => void
  readonly onDateToChange: (value: string) => void
  readonly onResetFilters: () => void
  readonly onRetryProducts: () => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
}

export function StockMovementHistory(props: StockMovementHistoryProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const {
    items,
    totalCount,
    page,
    pageSize,
    isLoading,
    isFetching,
    isError,
    isDateRangeValid,
    activeFilterCount,
    onPageChange,
    onRetry,
  } = props

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <History aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Kiểm soát tồn kho</p>
            <h1 className="mt-0.5 text-xl font-semibold">Lịch sử biến động</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Theo dõi mọi lần nhập, xuất, chuyển, trả và điều chỉnh tồn kho.
            </p>
          </div>
        </div>
        <div className="border-primary/20 bg-primary/5 flex min-h-10 items-center gap-2 border px-3">
          <History className="text-primary size-4" aria-hidden="true" />
          <span className="text-xs font-medium tabular-nums">{totalCount} biến động</span>
        </div>
      </header>
      <InventoryWorkspaceNavigation currentView="movements" />
      <section
        className="bg-card flex min-h-0 flex-col border"
        aria-labelledby="movement-history-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b p-3">
          <div>
            <h2 id="movement-history-title" className="text-sm font-semibold">
              Nhật ký tồn kho
            </h2>
            <p className="text-muted-foreground text-xs">Mới nhất được hiển thị trước.</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 sm:h-8"
              onClick={() => setIsFilterOpen(true)}
            >
              <ListFilter aria-hidden="true" />
              Bộ lọc{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-11 sm:size-8"
                  disabled={isFetching || !isDateRangeValid}
                  aria-label="Làm mới lịch sử biến động"
                  onClick={onRetry}
                >
                  <RefreshCw
                    className={isFetching ? 'animate-spin motion-reduce:animate-none' : undefined}
                    aria-hidden="true"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>Làm mới lịch sử</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {isFetching ? 'Đang cập nhật lịch sử biến động' : 'Lịch sử biến động đã cập nhật'}
        </p>
        {!isDateRangeValid ? (
          <OperationalEmptyState
            title="Khoảng thời gian không hợp lệ"
            description="Mở bộ lọc và chọn ngày bắt đầu không sau ngày kết thúc."
          />
        ) : isLoading ? (
          <OperationalLoadingState rows={8} />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải lịch sử biến động" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Không có biến động phù hợp"
            description={
              activeFilterCount
                ? 'Thử thay đổi hoặc đặt lại bộ lọc.'
                : 'Chưa có biến động tồn kho để hiển thị.'
            }
          />
        ) : (
          <>
            <StockMovementMobileList items={items} />
            <StockMovementDesktopTable items={items} />
            <OperationalPagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              isPending={isFetching}
              onPageChange={onPageChange}
            />
          </>
        )}
      </section>
      <StockMovementFilters {...props} open={isFilterOpen} onOpenChange={setIsFilterOpen} />
    </div>
  )
}
