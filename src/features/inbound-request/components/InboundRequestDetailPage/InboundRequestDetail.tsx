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
import { Textarea } from '@/components/ui/textarea'
import { APP_ROUTES } from '@/routes/app-routes'
import type {
  InboundRequestAction,
  InboundRequestDetail as InboundRequestDetailType,
} from '../../types/inbound-request.types'
import { INBOUND_REQUEST_ACTION } from '../../types/inbound-request.types'
import { InboundRequestStatusBadge } from '../InboundRequestsPage'
import { InboundRequestOverview } from './InboundRequestOverview'
import { InboundRequestLines } from './InboundRequestLines'

interface InboundRequestDetailProps {
  readonly inboundRequest: InboundRequestDetailType
  readonly allowedActions: readonly InboundRequestAction[]
  readonly isPending: boolean
  readonly onSubmit: () => Promise<boolean>
  readonly onApprove: () => Promise<boolean>
  readonly onReject: (reason: string) => Promise<boolean>
}

export function InboundRequestDetail({
  inboundRequest,
  allowedActions,
  isPending,
  onSubmit,
  onApprove,
  onReject,
}: InboundRequestDetailProps) {
  const [confirmationAction, setConfirmationAction] = useState<InboundRequestAction | null>(null)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  async function confirmAction() {
    if (!confirmationAction) return
    const succeeded =
      confirmationAction === INBOUND_REQUEST_ACTION.Submit ? await onSubmit() : await onApprove()
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
            <Link href={APP_ROUTES.inboundRequests as Route} aria-label="Quay lại danh sách">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-mono text-xl font-semibold">
                {inboundRequest.inboundRequestCode}
              </h1>
              <InboundRequestStatusBadge status={inboundRequest.status} />
            </div>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Hàng từ{' '}
              {inboundRequest.supplierName ?? inboundRequest.sourceName ?? 'Nguồn chưa xác định'}{' '}
              đến {inboundRequest.warehouseName ?? 'kho chưa xác định'}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {allowedActions.includes(INBOUND_REQUEST_ACTION.Update) ? (
            <Button asChild variant="outline">
              <Link href={APP_ROUTES.inboundRequestEdit(inboundRequest.id) as Route}>
                <Edit3 aria-hidden="true" />
                Chỉnh sửa
              </Link>
            </Button>
          ) : null}
          {allowedActions.includes(INBOUND_REQUEST_ACTION.Submit) ? (
            <Button
              type="button"
              onClick={() => setConfirmationAction(INBOUND_REQUEST_ACTION.Submit)}
            >
              <Send aria-hidden="true" />
              Gửi duyệt
            </Button>
          ) : null}
          {allowedActions.includes(INBOUND_REQUEST_ACTION.Reject) ? (
            <Button type="button" variant="outline" onClick={() => setIsRejectOpen(true)}>
              <X aria-hidden="true" />
              Từ chối
            </Button>
          ) : null}
          {allowedActions.includes(INBOUND_REQUEST_ACTION.Approve) ? (
            <Button
              type="button"
              onClick={() => setConfirmationAction(INBOUND_REQUEST_ACTION.Approve)}
            >
              <Check aria-hidden="true" />
              Phê duyệt
            </Button>
          ) : null}
        </div>
      </header>

      <InboundRequestOverview request={inboundRequest} />

      <InboundRequestLines lines={inboundRequest.lines} />

      <section className="bg-card border p-4" aria-labelledby="inbound-request-history">
        <h2 id="inbound-request-history" className="mb-4 text-sm font-semibold">
          Lịch sử xử lý
        </h2>
        <LifecycleTimeline events={inboundRequest.history} />
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
              {confirmationAction === INBOUND_REQUEST_ACTION.Approve
                ? 'Phê duyệt yêu cầu nhập kho?'
                : 'Gửi yêu cầu nhập kho để duyệt?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationAction === INBOUND_REQUEST_ACTION.Approve
                ? 'Yêu cầu nhập kho sẽ chuyển sang trạng thái sẵn sàng nhận hàng.'
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
            <DialogTitle>Từ chối yêu cầu nhập kho</DialogTitle>
            <DialogDescription>
              Nêu rõ nội dung cần chỉnh sửa để người tạo cập nhật đơn.
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(reasonError)}>
            <FieldLabel htmlFor="inbound-request-rejection-reason">Lý do</FieldLabel>
            <Textarea
              id="inbound-request-rejection-reason"
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
