'use client'

import { ArrowLeft, Check, Edit3, Send, X } from 'lucide-react'
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
import { Progress } from '@/components/ui/progress'
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
import type {
  PurchaseOrderAction,
  PurchaseOrderDetail as PurchaseOrderDetailType,
} from '../../types/purchase-order.types'
import {
  formatCurrency,
  formatOperationalDate,
  formatQuantity,
} from '../../utils/purchase-order-format'
import { PurchaseOrderStatusBadge } from '../PurchaseOrdersPage'

interface PurchaseOrderDetailProps {
  readonly purchaseOrder: PurchaseOrderDetailType
  readonly allowedActions: readonly PurchaseOrderAction[]
  readonly isPending: boolean
  readonly onSubmit: () => Promise<boolean>
  readonly onApprove: () => Promise<boolean>
  readonly onReject: (reason: string) => Promise<boolean>
}

export function PurchaseOrderDetail({
  purchaseOrder,
  allowedActions,
  isPending,
  onSubmit,
  onApprove,
  onReject,
}: PurchaseOrderDetailProps) {
  const [confirmationAction, setConfirmationAction] = useState<'Submit' | 'Approve' | null>(null)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const orderedQuantity = purchaseOrder.lines.reduce((sum, line) => sum + line.quantity, 0)
  const receivedQuantity = purchaseOrder.lines.reduce((sum, line) => sum + line.receivedQuantity, 0)
  const progress =
    orderedQuantity <= 0 ? 0 : Math.min(100, (receivedQuantity / orderedQuantity) * 100)

  async function confirmAction() {
    if (!confirmationAction) return
    const succeeded = confirmationAction === 'Submit' ? await onSubmit() : await onApprove()
    if (succeeded) setConfirmationAction(null)
  }

  async function reject() {
    const normalizedReason = reason.trim()
    if (!normalizedReason) {
      setReasonError('Vui lòng nhập lý do từ chối.')
      return
    }
    if (normalizedReason.length > 500) {
      setReasonError('Lý do không được vượt quá 500 ký tự.')
      return
    }
    const succeeded = await onReject(normalizedReason)
    if (succeeded) {
      setIsRejectOpen(false)
      setReason('')
      setReasonError('')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
      <header className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href={APP_ROUTES.purchaseOrders as Route} aria-label="Quay lại danh sách">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-xl font-semibold">{purchaseOrder.poNumber}</h1>
              <PurchaseOrderStatusBadge status={purchaseOrder.status} />
            </div>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Đơn từ {purchaseOrder.supplierName} đến{' '}
              {purchaseOrder.warehouseName ?? 'kho chưa xác định'}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {allowedActions.includes('Update') ? (
            <Button asChild variant="outline">
              <Link href={APP_ROUTES.purchaseOrderEdit(purchaseOrder.id) as Route}>
                <Edit3 aria-hidden="true" />
                Chỉnh sửa
              </Link>
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
        </div>
      </header>

      <section className="bg-card border" aria-labelledby="purchase-order-overview">
        <div className="border-b p-4">
          <h2 id="purchase-order-overview" className="text-sm font-semibold">
            Tổng quan
          </h2>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 p-4 lg:grid-cols-4">
          <Metadata label="Nhà cung cấp" value={purchaseOrder.supplierName} />
          <Metadata label="Kho nhận" value={purchaseOrder.warehouseName ?? 'Chưa xác định'} />
          <Metadata
            label="Ngày dự kiến"
            value={formatOperationalDate(purchaseOrder.expectedDate)}
          />
          <Metadata label="Người tạo" value={purchaseOrder.createdByName} />
          <div className="col-span-2 lg:col-span-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <dt className="text-muted-foreground text-xs">Tiến độ nhận</dt>
              <dd className="text-xs font-medium tabular-nums">
                {formatQuantity(receivedQuantity)} / {formatQuantity(orderedQuantity)}
              </dd>
            </div>
            <Progress value={progress} />
          </div>
        </dl>
        {purchaseOrder.rejectionReason ? (
          <div className="border-t px-4 py-3">
            <p className="text-destructive text-xs font-medium">Yêu cầu chỉnh sửa</p>
            <p className="mt-1 text-xs">{purchaseOrder.rejectionReason}</p>
          </div>
        ) : null}
      </section>

      <section className="bg-card border" aria-labelledby="purchase-order-lines">
        <div className="border-b p-4">
          <h2 id="purchase-order-lines" className="text-sm font-semibold">
            Chi tiết sản phẩm
          </h2>
          <p className="text-muted-foreground text-xs">
            {purchaseOrder.lines.length} dòng sản phẩm
          </p>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Đặt mua</TableHead>
                <TableHead className="text-right">Đã nhận</TableHead>
                <TableHead className="text-right">Còn lại</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrder.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <p className="font-medium">{line.productName}</p>
                    <p className="text-muted-foreground font-mono text-xs">{line.productSKU}</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(line.quantity)} {line.unitName}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(line.receivedQuantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatQuantity(line.remainingQuantity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(line.unitPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="divide-y md:hidden">
          {purchaseOrder.lines.map((line) => (
            <div key={line.id} className="p-4">
              <p className="font-medium">{line.productName}</p>
              <p className="text-muted-foreground font-mono text-xs">{line.productSKU}</p>
              <dl className="mt-3 grid grid-cols-3 gap-3">
                <Metadata label="Đặt" value={formatQuantity(line.quantity)} />
                <Metadata label="Đã nhận" value={formatQuantity(line.receivedQuantity)} />
                <Metadata label="Còn lại" value={formatQuantity(line.remainingQuantity)} />
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card border p-4" aria-labelledby="purchase-order-history">
        <h2 id="purchase-order-history" className="mb-4 text-sm font-semibold">
          Lịch sử xử lý
        </h2>
        <LifecycleTimeline events={purchaseOrder.history} />
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
              {confirmationAction === 'Approve' ? 'Phê duyệt đơn mua?' : 'Gửi đơn mua để duyệt?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationAction === 'Approve'
                ? 'Đơn mua sẽ chuyển sang trạng thái sẵn sàng nhận hàng.'
                : 'Sau khi gửi, bạn không thể chỉnh sửa cho đến khi đơn được trả lại.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault()
                void confirmAction()
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
            <DialogTitle>Từ chối đơn mua</DialogTitle>
            <DialogDescription>
              Nêu rõ nội dung cần chỉnh sửa để người tạo cập nhật đơn.
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(reasonError)}>
            <FieldLabel htmlFor="purchase-order-rejection-reason">Lý do</FieldLabel>
            <Textarea
              id="purchase-order-rejection-reason"
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
              Từ chối đơn
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
