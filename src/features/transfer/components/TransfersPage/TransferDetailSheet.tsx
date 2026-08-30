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
  formatTransferDate,
  formatTransferQuantity,
  TRANSFER_STATUS_DESCRIPTIONS,
} from '../../utils/transfer-format'
import { TransferStatusBadge } from './TransferStatusBadge'

interface TransferDetailSheetProps {
  readonly transfer: TransferSummary | null
  readonly onOpenChange: (open: boolean) => void
}

export function TransferDetailSheet({ transfer, onOpenChange }: TransferDetailSheetProps) {
  return (
    <Sheet open={Boolean(transfer)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {transfer ? (
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
              </dl>
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
                      <span className="text-sm font-medium tabular-nums">
                        {formatTransferQuantity(item.quantity)}
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
