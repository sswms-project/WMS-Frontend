'use client'

import { CircleOff, Loader2 } from 'lucide-react'
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

interface WarehouseDeactivateDialogProps {
  readonly warehouseName: string
  readonly warehouseCode: string
  readonly open: boolean
  readonly isPending: boolean
  readonly errorMessage: string | null
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function WarehouseDeactivateDialog({
  warehouseName,
  warehouseCode,
  open,
  isPending,
  errorMessage,
  onOpenChange,
  onConfirm,
}: WarehouseDeactivateDialogProps) {
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
          <AlertDialogTitle>Ngừng hoạt động kho “{warehouseName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Kho <span className="text-foreground font-mono">{warehouseCode}</span> sẽ không còn nhận
            các thay đổi cấu hình sau khi thao tác hoàn tất.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive border px-3 py-2 text-xs"
          >
            {errorMessage}
          </p>
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
                <Loader2 className="animate-spin" aria-hidden="true" />
                Đang xử lý
              </>
            ) : (
              'Xác nhận ngừng hoạt động'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
