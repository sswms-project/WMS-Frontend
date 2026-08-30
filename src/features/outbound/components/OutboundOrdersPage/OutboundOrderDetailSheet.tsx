'use client'

import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import type { OutboundOrderSummary } from '../../types/outbound.types'
import { formatOutboundDate, formatOutboundQuantity } from '../../utils/outbound-format'
import { OutboundOrderStatusBadge } from './OutboundOrderStatusBadge'

interface OutboundOrderDetailSheetProps {
  readonly order: OutboundOrderSummary | null
  readonly onOpenChange: (open: boolean) => void
  readonly isLoading: boolean
  readonly isError: boolean
  readonly onRetry: () => void
}

export function OutboundOrderDetailSheet({
  order,
  isLoading,
  isError,
  onRetry,
  onOpenChange,
}: OutboundOrderDetailSheetProps) {
  return (
    <Sheet open={Boolean(order) || isLoading || isError} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải chi tiết đơn xuất" onRetry={onRetry} />
        ) : order ? (
          <>
            <SheetHeader>
              <SheetTitle className="font-mono" translate="no">
                {order.orderCode}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <OutboundOrderStatusBadge status={order.status} />
                <span className="text-muted-foreground text-xs">
                  Tạo lúc {formatOutboundDate(order.createdAt)}
                </span>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs">Khách hàng</dt>
                  <dd className="text-sm font-medium">{order.customerName}</dd>
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
                          {item.sourceSlotCode ? ` · ${item.sourceSlotCode}` : ''}
                        </ItemDescription>
                      </ItemContent>
                      <span className="text-sm font-medium tabular-nums">
                        {formatOutboundQuantity(item.pickedQuantity)}/
                        {formatOutboundQuantity(item.quantity)}
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
