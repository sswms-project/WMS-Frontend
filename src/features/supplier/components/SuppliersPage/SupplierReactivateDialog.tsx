'use client'

import { Loader2, RotateCcw } from 'lucide-react'
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

interface SupplierReactivateDialogProps {
  readonly supplierName: string
  readonly open: boolean
  readonly isPending: boolean
  readonly errorMessage: string | null
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function SupplierReactivateDialog({
  supplierName,
  open,
  isPending,
  errorMessage,
  onOpenChange,
  onConfirm,
}: SupplierReactivateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogMedia>
            <RotateCcw aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Khôi phục hợp tác với “{supplierName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Nhà cung cấp sẽ trở lại trạng thái đang hợp tác và có thể được chọn khi tạo đơn mua mới.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Chưa thể khôi phục hợp tác</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
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
              'Xác nhận khôi phục'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
