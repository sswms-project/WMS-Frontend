'use client'

import {
  ArrowLeft,
  Check,
  PackageCheck,
  Pencil,
  Send,
  Undo2,
  UserCheck,
  UserRoundCog,
} from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { APP_ROUTES } from '@/routes/app-routes'
import type {
  GoodsReceiptAction,
  GoodsReceiptDetail as ReceiptDetailType,
} from '../../types/inbound.types'
import { InboundStatusBadge } from '../InboundWorkspace'
import { ReceiptActionDialogs } from './ReceiptActionDialogs'
import { ReceiptHistorySheet } from './ReceiptHistorySheet'
import { ReceiptItemsTable } from './ReceiptItemsTable'
import { ReceiptOverview } from './ReceiptOverview'
import { ReceiptPutAwayTable } from './ReceiptPutAwayTable'

interface ReceiptDetailProps {
  readonly receipt: ReceiptDetailType
  readonly allowedActions: readonly GoodsReceiptAction[]
  readonly isPending: boolean
  readonly onUpdate: () => void
  readonly onSubmit: () => Promise<boolean>
  readonly onApprove: () => Promise<boolean>
  readonly onReject: (reason: string) => Promise<boolean>
  readonly onAssignPutAway?: () => void
}

export function ReceiptDetail({
  receipt,
  allowedActions,
  isPending,
  onUpdate,
  onSubmit,
  onApprove,
  onReject,
  onAssignPutAway,
}: ReceiptDetailProps) {
  const [confirmationAction, setConfirmationAction] = useState<'Submit' | 'Approve' | null>(null)
  const [isRejectOpen, setIsRejectOpen] = useState(false)

  const hasPutAwayDetails = receipt.items.some((item) => item.putAwayDetails.length > 0)

  async function confirm() {
    if (!confirmationAction) return
    const succeeded = confirmationAction === 'Submit' ? await onSubmit() : await onApprove()
    if (succeeded) setConfirmationAction(null)
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <header className="shrink-0 border-b px-4 py-3 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <Button asChild variant="outline" size="icon">
              <Link href={APP_ROUTES.goodsReceipts as Route} aria-label="Quay lại danh sách">
                <ArrowLeft aria-hidden="true" />
              </Link>
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-mono text-xl font-semibold">{receipt.receiptCode}</h1>
                <InboundStatusBadge status={receipt.status} />
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                Yêu cầu nhập kho {receipt.inboundRequestCode} · {receipt.warehouseName}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ReceiptHistorySheet events={receipt.history} receiptCode={receipt.receiptCode} />
            {allowedActions.includes('Update') ? (
              <Button type="button" variant="outline" disabled={isPending} onClick={onUpdate}>
                <Pencil aria-hidden="true" />
                Chỉnh sửa
              </Button>
            ) : null}
            {allowedActions.includes('Submit') ? (
              <Button type="button" onClick={() => setConfirmationAction('Submit')}>
                <Send aria-hidden="true" />
                Gửi duyệt
              </Button>
            ) : null}
            {allowedActions.includes('Reject') ? (
              <Button type="button" variant="outline" onClick={() => setIsRejectOpen(true)}>
                <Undo2 aria-hidden="true" />
                Trả sửa
              </Button>
            ) : null}
            {allowedActions.includes('Approve') ? (
              <Button type="button" onClick={() => setConfirmationAction('Approve')}>
                <Check aria-hidden="true" />
                Phê duyệt
              </Button>
            ) : null}
            {allowedActions.includes('AssignPutAway') && onAssignPutAway ? (
              <Button
                type="button"
                variant={receipt.putAwayAssignedTo ? 'outline' : 'default'}
                onClick={onAssignPutAway}
              >
                {receipt.putAwayAssignedTo ? (
                  <UserRoundCog aria-hidden="true" />
                ) : (
                  <UserCheck aria-hidden="true" />
                )}
                {receipt.putAwayAssignedTo ? 'Giao lại cất hàng' : 'Giao việc cất hàng'}
              </Button>
            ) : null}
            {allowedActions.includes('PutAway') ? (
              <Button asChild>
                <Link href={APP_ROUTES.inboundPutawayDetail(receipt.id) as Route}>
                  <PackageCheck aria-hidden="true" />
                  Cất hàng
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1180px] flex-1 flex-col gap-4 px-4 py-4 lg:px-8">
        <ReceiptOverview receipt={receipt} />

        <Tabs defaultValue="items" className="flex min-h-0 flex-1 flex-col">
          <TabsList variant="line" className="shrink-0">
            <TabsTrigger value="items">
              Hàng hóa thực nhận
              <span className="bg-muted text-muted-foreground ml-1.5 rounded px-1.5 py-0.5 text-xs tabular-nums">
                {receipt.items.length}
              </span>
            </TabsTrigger>
            {hasPutAwayDetails ? (
              <TabsTrigger value="putaway">Chi tiết cất hàng</TabsTrigger>
            ) : null}
          </TabsList>

          <div className="bg-card min-h-0 flex-1 border">
            <div className="border-b px-4 py-3">
              <p className="text-muted-foreground text-xs">
                Số lượng hỏng không được đưa vào cất hàng.
              </p>
            </div>
            <TabsContent
              value="items"
              className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
            >
              <ReceiptItemsTable items={receipt.items} />
            </TabsContent>
            {hasPutAwayDetails ? (
              <TabsContent
                value="putaway"
                className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
              >
                <ReceiptPutAwayTable items={receipt.items} />
              </TabsContent>
            ) : null}
          </div>
        </Tabs>
      </div>

      <ReceiptActionDialogs
        confirmationAction={confirmationAction}
        isRejectOpen={isRejectOpen}
        isPending={isPending}
        onConfirm={confirm}
        onCancelConfirmation={() => setConfirmationAction(null)}
        onReject={onReject}
        onRejectOpenChange={setIsRejectOpen}
      />
    </div>
  )
}
