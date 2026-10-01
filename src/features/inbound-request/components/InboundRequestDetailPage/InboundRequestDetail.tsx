'use client'

import { ArrowLeft, Check, Edit3, Mail, Send, X } from 'lucide-react'
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

const MISSING_SUPPLIER_EMAIL_HINT_ID = 'inbound-request-missing-supplier-email'

interface InboundRequestDetailProps {
  readonly inboundRequest: InboundRequestDetailType
  readonly allowedActions: readonly InboundRequestAction[]
  readonly isPending: boolean
  readonly onSubmit: () => Promise<boolean>
  readonly onApprove: () => Promise<boolean>
  readonly onApproveAndSend: () => Promise<boolean>
  readonly onSendToSupplier: () => Promise<boolean>
  readonly onReject: (reason: string) => Promise<boolean>
}

const INBOUND_REQUEST_HISTORY_ACTION_LABELS: Readonly<Record<string, string>> = {
  Approve: 'Phê duyệt yêu cầu',
  AssignReceivingTask: 'Phân công nhiệm vụ nhận hàng',
  Create: 'Tạo yêu cầu nhập kho',
  Delete: 'Xóa yêu cầu nhập kho',
  Duplicate: 'Sao chép yêu cầu nhập kho',
  PauseWarehouseTask: 'Tạm dừng nhiệm vụ nhận hàng',
  Receive: 'Tiếp nhận hàng',
  ReassignReceivingTask: 'Phân công lại nhiệm vụ nhận hàng',
  Reject: 'Từ chối yêu cầu',
  ResendToSupplier: 'Gửi lại mail cho nhà cung cấp',
  ReturnWarehouseTask: 'Trả nhiệm vụ nhận hàng về hàng đợi',
  SendToSupplier: 'Gửi mail cho nhà cung cấp',
  StartWarehouseTask: 'Bắt đầu nhiệm vụ nhận hàng',
  Submit: 'Gửi yêu cầu duyệt',
  UnassignReceivingTask: 'Hủy giao nhiệm vụ nhận hàng',
  Update: 'Cập nhật yêu cầu',
}

const INBOUND_REQUEST_HISTORY_REASON_LABELS: Readonly<Record<string, string>> = {
  ResendToSupplier: 'Người nhận',
  SendToSupplier: 'Người nhận',
}
export function InboundRequestDetail({
  inboundRequest,
  allowedActions,
  isPending,
  onSubmit,
  onApprove,
  onApproveAndSend,
  onSendToSupplier,
  onReject,
}: InboundRequestDetailProps) {
  const [confirmationAction, setConfirmationAction] = useState<InboundRequestAction | null>(null)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  async function confirmAction() {
    if (!confirmationAction) return
    const handlers: Partial<Record<InboundRequestAction, () => Promise<boolean>>> = {
      [INBOUND_REQUEST_ACTION.Submit]: onSubmit,
      [INBOUND_REQUEST_ACTION.Approve]: onApprove,
      [INBOUND_REQUEST_ACTION.ApproveAndSend]: onApproveAndSend,
      [INBOUND_REQUEST_ACTION.SendToSupplier]: onSendToSupplier,
    }
    const succeeded = await handlers[confirmationAction]?.()
    if (succeeded) setConfirmationAction(null)
  }

  const supplierEmail = inboundRequest.supplierEmail
  const canMailSupplier = Boolean(inboundRequest.supplierId)
  const hasSentToSupplier = Boolean(inboundRequest.supplierEmailSentAt)
  const confirmationCopy = getConfirmationCopy(confirmationAction, supplierEmail)
  const showMissingEmailHint =
    canMailSupplier &&
    !supplierEmail &&
    (allowedActions.includes(INBOUND_REQUEST_ACTION.ApproveAndSend) ||
      allowedActions.includes(INBOUND_REQUEST_ACTION.SendToSupplier))

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
              variant={canMailSupplier ? 'outline' : 'default'}
              onClick={() => setConfirmationAction(INBOUND_REQUEST_ACTION.Approve)}
            >
              <Check aria-hidden="true" />
              Chỉ phê duyệt
            </Button>
          ) : null}
          {canMailSupplier && allowedActions.includes(INBOUND_REQUEST_ACTION.ApproveAndSend) ? (
            <Button
              type="button"
              disabled={!supplierEmail}
              aria-describedby={supplierEmail ? undefined : MISSING_SUPPLIER_EMAIL_HINT_ID}
              onClick={() => setConfirmationAction(INBOUND_REQUEST_ACTION.ApproveAndSend)}
            >
              <Mail aria-hidden="true" />
              Duyệt và gửi mail
            </Button>
          ) : null}
          {canMailSupplier && allowedActions.includes(INBOUND_REQUEST_ACTION.SendToSupplier) ? (
            <Button
              type="button"
              variant={hasSentToSupplier ? 'outline' : 'default'}
              disabled={!supplierEmail}
              aria-describedby={supplierEmail ? undefined : MISSING_SUPPLIER_EMAIL_HINT_ID}
              onClick={() => setConfirmationAction(INBOUND_REQUEST_ACTION.SendToSupplier)}
            >
              <Mail aria-hidden="true" />
              {hasSentToSupplier ? 'Gửi lại mail' : 'Gửi mail nhà cung cấp'}
            </Button>
          ) : null}
        </div>
      </header>

      {showMissingEmailHint ? (
        <p
          id={MISSING_SUPPLIER_EMAIL_HINT_ID}
          className="text-muted-foreground -mt-2 text-xs"
          role="note"
        >
          Nhà cung cấp chưa có email nên chưa thể gửi mail đơn hàng. Hãy cập nhật email của nhà cung
          cấp trước.
        </p>
      ) : null}

      <InboundRequestOverview request={inboundRequest} />

      <InboundRequestLines lines={inboundRequest.lines} />

      <section
        className="bg-card rounded-lg border p-4 sm:p-5"
        aria-labelledby="inbound-request-history"
      >
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 id="inbound-request-history" className="text-base font-semibold">
              Lịch sử xử lý
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Các thay đổi đã thực hiện trên yêu cầu nhập kho
            </p>
          </div>
          <span className="bg-muted text-muted-foreground shrink-0 rounded-sm px-2 py-1 text-xs font-medium">
            {inboundRequest.history.length} hoạt động
          </span>
        </header>
        <LifecycleTimeline
          events={inboundRequest.history}
          actionLabels={INBOUND_REQUEST_HISTORY_ACTION_LABELS}
          reasonLabels={INBOUND_REQUEST_HISTORY_REASON_LABELS}
        />
      </section>

      <AlertDialog
        open={Boolean(confirmationAction)}
        onOpenChange={(open) => {
          if (!open) setConfirmationAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationCopy.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmationCopy.description}</AlertDialogDescription>
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

function getConfirmationCopy(action: InboundRequestAction | null, supplierEmail: string | null) {
  const mailNote = `Email kèm file PDF đơn đặt hàng sẽ được gửi tới ${supplierEmail ?? 'nhà cung cấp'}, đồng thời CC người tạo và người duyệt.`
  switch (action) {
    case INBOUND_REQUEST_ACTION.Approve:
      return {
        title: 'Phê duyệt yêu cầu nhập kho?',
        description: 'Yêu cầu nhập kho sẽ chuyển sang trạng thái sẵn sàng nhận hàng.',
      }
    case INBOUND_REQUEST_ACTION.ApproveAndSend:
      return {
        title: 'Phê duyệt và gửi mail cho nhà cung cấp?',
        description: `Yêu cầu sẽ được phê duyệt. ${mailNote} Nếu gửi mail lỗi, yêu cầu vẫn được duyệt và bạn có thể gửi lại.`,
      }
    case INBOUND_REQUEST_ACTION.SendToSupplier:
      return {
        title: 'Gửi mail cho nhà cung cấp?',
        description: mailNote,
      }
    default:
      return {
        title: 'Gửi yêu cầu nhập kho để duyệt?',
        description: 'Sau khi gửi, bạn không thể chỉnh sửa cho đến khi đơn được trả lại.',
      }
  }
}
