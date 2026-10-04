import { useState } from 'react'
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

interface ReceiptActionDialogsProps {
  readonly confirmationAction: 'Submit' | 'Approve' | null
  readonly isRejectOpen: boolean
  readonly isPending: boolean
  readonly selfApprovalRequired: boolean
  readonly onConfirm: () => Promise<void>
  readonly onCancelConfirmation: () => void
  readonly onReject: (reason: string) => Promise<boolean>
  readonly onRejectOpenChange: (open: boolean) => void
}

export function ReceiptActionDialogs({
  confirmationAction,
  isRejectOpen,
  isPending,
  selfApprovalRequired,
  onConfirm,
  onCancelConfirmation,
  onReject,
  onRejectOpenChange,
}: ReceiptActionDialogsProps) {
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  async function submitReject() {
    const normalized = reason.trim()
    if (!normalized) {
      setReasonError('Vui lòng nhập lý do trả sửa.')
      return
    }
    if (normalized.length > 500) {
      setReasonError('Lý do không được vượt quá 500 ký tự.')
      return
    }
    if (await onReject(normalized)) {
      onRejectOpenChange(false)
      setReason('')
      setReasonError('')
    }
  }

  return (
    <>
      <AlertDialog
        open={Boolean(confirmationAction)}
        onOpenChange={(open) => {
          if (!open) onCancelConfirmation()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationAction === 'Approve'
                ? 'Xác nhận hàng đã đến kho?'
                : 'Gửi phiếu nhận hàng để duyệt?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationAction === 'Approve'
                ? selfApprovalRequired
                  ? 'Bạn là người ghi nhận phiếu này. Khi xác nhận, hệ thống sẽ lưu hành động tự phê duyệt trước khi cất hàng.'
                  : 'Số lượng nhận sẽ được ghi nhận vào yêu cầu nhập kho và chuyển sang chờ cất hàng.'
                : 'Phiếu sẽ được khóa chỉnh sửa trong lúc chờ quản lý duyệt.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault()
                void onConfirm()
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isRejectOpen} onOpenChange={onRejectOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trả sửa phiếu nhận hàng</DialogTitle>
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
              onClick={() => onRejectOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => void submitReject()}
            >
              Trả sửa phiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
