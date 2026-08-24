'use client'

import { ArrowLeft, Check, PackageCheck, Pencil, Send, X } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { LifecycleTimeline } from '@/components/operations/LifecycleTimeline'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  formatOperationalDate,
  formatQuantity,
} from '@/features/purchase-order/utils/purchase-order-format'
import type {
  InboundReceiptAction,
  InboundReceiptDetail as ReceiptDetailType,
} from '../../types/inbound.types'
import { InboundStatusBadge } from '../InboundWorkspace'

interface ReceiptDetailProps {
  readonly receipt: ReceiptDetailType
  readonly allowedActions: readonly InboundReceiptAction[]
  readonly isPending: boolean
  readonly onUpdate: () => void
  readonly onSubmit: () => Promise<boolean>
  readonly onApprove: () => Promise<boolean>
  readonly onReject: (reason: string) => Promise<boolean>
}

export function ReceiptDetail({
  receipt,
  allowedActions,
  isPending,
  onUpdate,
  onSubmit,
  onApprove,
  onReject,
}: ReceiptDetailProps) {
  const [confirmationAction, setConfirmationAction] = useState<'Submit' | 'Approve' | null>(null)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  async function confirm() {
    if (!confirmationAction) return
    const succeeded = confirmationAction === 'Submit' ? await onSubmit() : await onApprove()
    if (succeeded) setConfirmationAction(null)
  }

  async function reject() {
    const normalized = reason.trim()
    if (!normalized) {
      setReasonError('Vui lòng nhập lý do từ chối.')
      return
    }
    if (normalized.length > 500) {
      setReasonError('Lý do không được vượt quá 500 ký tự.')
      return
    }
    if (await onReject(normalized)) {
      setIsRejectOpen(false)
      setReason('')
      setReasonError('')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
      <header className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href={APP_ROUTES.inboundReceipts as Route} aria-label="Quay lại danh sách">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-xl font-semibold">{receipt.receiptCode}</h1>
              <InboundStatusBadge status={receipt.status} />
            </div>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Đơn mua {receipt.poNumber} · {receipt.warehouseName}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
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
              <X aria-hidden="true" />
              Từ chối
            </Button>
          ) : null}
          {allowedActions.includes('Approve') ? (
            <Button type="button" onClick={() => setConfirmationAction('Approve')}>
              <Check aria-hidden="true" />
              Phê duyệt
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
      </header>
      <section className="bg-card border">
        <div className="border-b p-4">
          <h2 className="text-sm font-semibold">Tổng quan phiếu nhập</h2>
        </div>
        <dl className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-4">
          <Metadata label="Đơn mua" value={receipt.poNumber} />
          <Metadata label="Kho nhận" value={receipt.warehouseName} />
          <Metadata label="Người tạo" value={receipt.createdByName} />
          <Metadata label="Ngày tạo" value={formatOperationalDate(receipt.createdAt)} />
        </dl>
        {receipt.rejectionReason ? (
          <div className="border-t p-4">
            <p className="text-destructive text-xs font-medium">Yêu cầu chỉnh sửa</p>
            <p className="mt-1 text-xs">{receipt.rejectionReason}</p>
          </div>
        ) : null}
      </section>
      <section className="bg-card border">
        <div className="border-b p-4">
          <h2 className="text-sm font-semibold">Hàng hóa thực nhận</h2>
          <p className="text-muted-foreground text-xs">
            Số lượng hỏng không được đưa vào cất hàng.
          </p>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Theo PO</TableHead>
                <TableHead className="text-right">Thực nhận</TableHead>
                <TableHead className="text-right">Hỏng</TableHead>
                <TableHead className="text-right">Khả dụng</TableHead>
                <TableHead className="text-right">Còn cất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipt.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground font-mono text-xs">{item.productSKU}</p>
                    {item.exceptionReason ? (
                      <p className="text-destructive mt-1 text-xs">{item.exceptionReason}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(item.orderedQuantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(item.receivedQuantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(item.damagedQuantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(item.usableQuantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(item.remainingPutAwayQuantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="divide-y md:hidden">
          {receipt.items.map((item) => (
            <div key={item.id} className="p-4">
              <p className="font-medium">{item.productName}</p>
              <p className="text-muted-foreground font-mono text-xs">{item.productSKU}</p>
              <dl className="mt-3 grid grid-cols-3 gap-3">
                <Metadata label="Nhận" value={formatQuantity(item.receivedQuantity)} />
                <Metadata label="Hỏng" value={formatQuantity(item.damagedQuantity)} />
                <Metadata label="Còn cất" value={formatQuantity(item.remainingPutAwayQuantity)} />
              </dl>
              {item.exceptionReason ? (
                <p className="text-destructive mt-2 text-xs">{item.exceptionReason}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
      <section className="bg-card border p-4">
        <h2 className="mb-4 text-sm font-semibold">Lịch sử xử lý</h2>
        <LifecycleTimeline events={receipt.history} />
      </section>
      <AlertDialog
        open={Boolean(confirmationAction)}
        onOpenChange={(open) => {
          if (!open) setConfirmationAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationAction === 'Approve'
                ? 'Phê duyệt phiếu nhập?'
                : 'Gửi phiếu nhập để duyệt?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationAction === 'Approve'
                ? 'Số lượng nhận sẽ được ghi nhận vào đơn mua và chuyển sang chờ cất hàng.'
                : 'Phiếu sẽ được khóa chỉnh sửa trong lúc chờ quản lý duyệt.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault()
                void confirm()
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối phiếu nhập</DialogTitle>
            <DialogDescription>
              Ghi rõ số lượng hoặc tình trạng hàng cần kiểm tra lại.
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(reasonError)}>
            <FieldLabel htmlFor="receipt-rejection-reason">Lý do</FieldLabel>
            <Textarea
              id="receipt-rejection-reason"
              value={reason}
              maxLength={500}
              aria-invalid={Boolean(reasonError)}
              onChange={(event) => {
                setReason(event.target.value)
                setReasonError('')
              }}
            />
            <FieldError>{reasonError}</FieldError>
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsRejectOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => void reject()}
            >
              Từ chối phiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Metadata({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
    </div>
  )
}
