'use client'

import { CircleOff, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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

interface SupplierDeactivateDialogProps {
  readonly supplierName: string
  readonly open: boolean
  readonly isPending: boolean
  readonly errorMessage: string | null
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function SupplierDeactivateDialog({
  supplierName,
  open,
  isPending,
  errorMessage,
  onOpenChange,
  onConfirm,
}: SupplierDeactivateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <CircleOff aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Ngừng hợp tác với “{supplierName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Nhà cung cấp sẽ chuyển sang trạng thái ngừng hợp tác và không còn xuất hiện khi tạo đơn
            mua mới. Các đơn mua đã tạo trước đó vẫn được giữ nguyên.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Chưa thể ngừng hợp tác</AlertTitle>
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
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
                Đang xử lý…
              </>
            ) : (
              'Xác nhận ngừng hợp tác'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
