'use client'

import { CircleOff, LoaderCircle } from 'lucide-react'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface WarehouseLocationDeactivateDialogProps {
  readonly open: boolean
  readonly locationLabel: string
  readonly locationCode: string
  readonly isPending: boolean
  readonly errorMessage: string | null
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function WarehouseLocationDeactivateDialog({
  open,
  locationLabel,
  locationCode,
  isPending,
  errorMessage,
  onOpenChange,
  onConfirm,
}: WarehouseLocationDeactivateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CircleOff aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Ngừng hoạt động {locationLabel}</AlertDialogTitle>
          <AlertDialogDescription>
            {locationLabel}{' '}
            <span translate="no" className="font-mono">
              {locationCode}
            </span>{' '}
            sẽ không thể tiếp tục cấu hình hoặc phát hành barcode. Thao tác bị chặn nếu vị trí này
            hoặc các vị trí con còn hàng hay lượng giữ chỗ.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Chưa thể ngừng hoạt động</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {isPending ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
              <CircleOff data-icon="inline-start" aria-hidden="true" />
            )}
            Xác nhận ngừng
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
