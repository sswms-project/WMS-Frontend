import { Truck } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { TransferSummary } from '../../types/transfer.types'

export function DispatchTransferDialog({
  transfer,
  isPending,
  onOpenChange,
  onConfirm,
}: {
  readonly transfer: TransferSummary | null
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}) {
  return (
    <AlertDialog
      open={Boolean(transfer)}
      onOpenChange={(open) => {
        if (!isPending) onOpenChange(open)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Truck />
          </AlertDialogMedia>
          <AlertDialogTitle>Xác nhận xuất hàng?</AlertDialogTitle>
          <AlertDialogDescription>
            Phiếu {transfer?.transferCode} sẽ chuyển sang trạng thái đang vận chuyển. Hãy chắc chắn
            hàng đã rời kho nguồn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={onConfirm}>
            {isPending ? 'Đang xác nhận...' : 'Xác nhận xuất hàng'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
