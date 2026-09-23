'use client'

import { CircleOff, Loader2, RotateCcw } from 'lucide-react'
import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface WarehouseDeactivateDialogProps {
  readonly warehouseName: string
  readonly warehouseCode: string
  readonly open: boolean
  readonly isPending: boolean
  readonly errorMessage: string | null
  readonly isReactivation?: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: (reason: string | null) => void
}

export function WarehouseDeactivateDialog({
  warehouseName,
  warehouseCode,
  open,
  isPending,
  errorMessage,
  isReactivation = false,
  onOpenChange,
  onConfirm,
}: WarehouseDeactivateDialogProps) {
  const [reason, setReason] = useState('')

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) {
          if (!nextOpen) setReason('')
          onOpenChange(nextOpen)
        }
      }}
    >
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (isPending) event.preventDefault()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            {isReactivation ? <RotateCcw aria-hidden="true" /> : <CircleOff aria-hidden="true" />}
          </AlertDialogMedia>
          <AlertDialogTitle>
            {isReactivation ? 'Kích hoạt lại' : 'Ngừng hoạt động'} kho “{warehouseName}”?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Kho{' '}
            <span translate="no" className="text-foreground font-mono">
              {warehouseCode}
            </span>{' '}
            {isReactivation
              ? ' sẽ hoạt động trở lại sau khi hệ thống kiểm tra giới hạn số kho của gói dịch vụ.'
              : ' sẽ không còn nhận các thay đổi cấu hình sau khi thao tác hoàn tất. Hệ thống sẽ kiểm tra tồn kho, lượng giữ chỗ, điều chuyển và phiếu xuất đang mở trước khi xác nhận.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>
              {isReactivation ? 'Chưa thể kích hoạt lại kho' : 'Chưa thể ngừng hoạt động kho'}
            </AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="warehouse-lifecycle-reason">Lý do (không bắt buộc)</Label>
          <Textarea
            id="warehouse-lifecycle-reason"
            name="warehouseLifecycleReason"
            autoComplete="off"
            value={reason}
            maxLength={500}
            disabled={isPending}
            placeholder="Nhập lý do nếu cần lưu vào nhật ký"
            onChange={(event) => setReason(event.currentTarget.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirm(reason.trim() || null)
            }}
          >
            {isPending ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
                Đang xử lý…
              </>
            ) : isReactivation ? (
              'Xác nhận kích hoạt'
            ) : (
              'Xác nhận ngừng hoạt động'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
