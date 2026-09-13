'use client'

import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { TransferSummary } from '../../types/transfer.types'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import {
  formatTransferDate,
  formatTransferQuantity,
  TRANSFER_STATUS_DESCRIPTIONS,
} from '../../utils/transfer-format'
import { TransferStatusBadge } from './TransferStatusBadge'

interface TransferDetailSheetProps {
  readonly transfer: TransferSummary | null
  readonly isLoading: boolean
  readonly isError: boolean
  readonly onRetry: () => void
  readonly onOpenChange: (open: boolean) => void
}

export function TransferDetailSheet({
  transfer,
  isLoading,
  isError,
  onRetry,
  onOpenChange,
}: TransferDetailSheetProps) {
  return (
    <Sheet open={Boolean(transfer) || isLoading || isError} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {isLoading ? (
          <OperationalLoadingState />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải chi tiết phiếu" onRetry={onRetry} />
        ) : transfer ? (
          <>
            <SheetHeader>
              <SheetTitle className="font-mono" translate="no">
                {transfer.transferCode}
              </SheetTitle>
              <SheetDescription>{TRANSFER_STATUS_DESCRIPTIONS[transfer.status]}</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 px-4 pb-6">
              <div className="flex flex-wrap items-center gap-3">
                <TransferStatusBadge status={transfer.status} />
                <span className="text-muted-foreground text-xs">
                  Tạo lúc {formatTransferDate(transfer.createdAt)}
                </span>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs">Kho xuất</dt>
                  <dd className="text-sm font-medium">{transfer.sourceWarehouseName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Kho nhận</dt>
                  <dd className="text-sm font-medium">{transfer.destinationWarehouseName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Người tạo</dt>
                  <dd className="text-sm font-medium">{transfer.createdBy}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Người duyệt</dt>
                  <dd className="text-sm font-medium">{transfer.approvedBy ?? '—'}</dd>
                </div>
              </dl>
              {transfer.approvalNote ? (
                <p className="text-sm">
                  <span className="text-muted-foreground">Ghi chú duyệt:</span>{' '}
                  {transfer.approvalNote}
                </p>
              ) : null}
              {transfer.rejectionReason ? (
                <p className="text-destructive text-sm">
                  Lý do từ chối: {transfer.rejectionReason}
                </p>
              ) : null}
              <section className="space-y-2">
                <h3 className="text-sm font-medium">
                  Sản phẩm điều chuyển{' '}
                  <span className="text-muted-foreground tabular-nums">
                    ({transfer.items.length})
                  </span>
                </h3>
                <ItemGroup>
                  {transfer.items.map((item) => (
                    <Item key={item.id} variant="outline">
                      <ItemContent>
                        <ItemTitle className="truncate">{item.productName}</ItemTitle>
                        <ItemDescription>
                          <span className="font-mono" translate="no">
                            {item.sku}
                          </span>{' '}
                          · {item.sourceSlotCode} → {item.destinationSlotCode}
                        </ItemDescription>
                      </ItemContent>
                      <span className="text-right text-xs tabular-nums">
                        YC {formatTransferQuantity(item.quantity)}
                        <br />
                        Duyệt {formatTransferQuantity(item.approvedQuantity)} · Xuất{' '}
                        {formatTransferQuantity(item.dispatchedQuantity)}
                        <br />
                        Nhận {formatTransferQuantity(item.receivedQuantity)} · Hỏng{' '}
                        {formatTransferQuantity(item.damagedQuantity)} · Thiếu{' '}
                        {formatTransferQuantity(item.missingQuantity)}
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
