'use client'

import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import type { StockIssueRequestSummary } from '../../types/stock-issue.types'
import { formatStockIssueDate, formatStockIssueQuantity } from '../../utils/stock-issue-format'
import { StockIssueRequestStatusBadge } from './StockIssueRequestStatusBadge'

interface StockIssueRequestDetailSheetProps {
  readonly order: StockIssueRequestSummary | null
  readonly onOpenChange: (open: boolean) => void
  readonly isLoading: boolean
  readonly isError: boolean
  readonly onRetry: () => void
  readonly isRemovingPick: boolean
  readonly onRemovePickDetail: (pickDetailId: string) => void
}

export function StockIssueRequestDetailSheet({
  order,
  isLoading,
  isError,
  onRetry,
  onOpenChange,
  isRemovingPick,
  onRemovePickDetail,
}: StockIssueRequestDetailSheetProps) {
  return (
    <Sheet open={Boolean(order) || isLoading || isError} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState
            title="Không thể tải chi tiết yêu cầu xuất kho"
            onRetry={onRetry}
          />
        ) : order ? (
          <>
            <SheetHeader>
              <SheetTitle className="font-mono" translate="no">
                {order.stockIssueRequestCode}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <StockIssueRequestStatusBadge status={order.status} />
                <span className="text-muted-foreground text-xs">
                  Tạo lúc {formatStockIssueDate(order.createdAt)}
                </span>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs">Đơn vị nhận hàng</dt>
                  <dd className="text-sm font-medium">{order.recipientName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Kho xuất</dt>
                  <dd className="text-sm font-medium">{order.warehouseName}</dd>
                </div>
              </dl>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs">Người nhận</dt>
                  <dd className="text-sm font-medium">{order.recipientName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Điện thoại</dt>
                  <dd className="text-sm font-medium">{order.recipientPhone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground text-xs">Địa chỉ nhận</dt>
                  <dd className="text-sm font-medium">{order.recipientAddress}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground text-xs">Mục đích</dt>
                  <dd className="text-sm font-medium">{order.purpose ?? '—'}</dd>
                </div>
              </dl>
              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  Sản phẩm xuất kho{' '}
                  <span className="text-muted-foreground tabular-nums">({order.items.length})</span>
                </h3>
                <ItemGroup>
                  {order.items.map((item) => (
                    <Item key={item.id} variant="outline">
                      <ItemContent>
                        <ItemTitle className="truncate">{item.productName}</ItemTitle>
                        <ItemDescription>
                          <span className="font-mono" translate="no">
                            {item.sku}
                          </span>
                        </ItemDescription>
                        {item.pickDetails.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {item.pickDetails.map((detail) => (
                              <div key={detail.id} className="bg-muted/40 border p-2 text-xs">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p>
                                      Vị trí <span className="font-mono">{detail.slotCode}</span>
                                      {detail.lotNumber ? (
                                        <>
                                          {' '}
                                          · Lô <span className="font-mono">{detail.lotNumber}</span>
                                        </>
                                      ) : null}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {detail.qualityStatus} ·{' '}
                                      {formatStockIssueQuantity(detail.pickedQuantity)} ·{' '}
                                      {detail.pickedByName} ·{' '}
                                      {formatStockIssueDate(detail.pickedAt)}
                                    </p>
                                    <p className="text-muted-foreground">
                                      {detail.issuedAt
                                        ? `Đã xuất ${formatStockIssueDate(detail.issuedAt)}`
                                        : 'Chưa xuất kho'}
                                    </p>
                                  </div>
                                  {!detail.issuedAt ? (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      disabled={isRemovingPick}
                                      onClick={() => onRemovePickDetail(detail.id)}
                                    >
                                      Bỏ phân bổ
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </ItemContent>
                      <span className="text-sm font-medium tabular-nums">
                        {formatStockIssueQuantity(item.pickedQuantity)}/
                        {formatStockIssueQuantity(item.quantity)}
                      </span>
                    </Item>
                  ))}
                </ItemGroup>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
