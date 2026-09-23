'use client'

import { CircleOff, LoaderCircle, RotateCcw } from 'lucide-react'
import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface WarehouseLocationDeactivateDialogProps {
  readonly open: boolean
  readonly locationLabel: string
  readonly locationCode: string
  readonly isPending: boolean
  readonly errorMessage: string | null
  readonly isReactivation?: boolean
  readonly cascadeDescription?: string | null
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: (reason: string | null, cascadeToChildren: boolean) => void
}

export function WarehouseLocationDeactivateDialog({
  open,
  locationLabel,
  locationCode,
  isPending,
  errorMessage,
  isReactivation = false,
  cascadeDescription = null,
  onOpenChange,
  onConfirm,
}: WarehouseLocationDeactivateDialogProps) {
  const [reason, setReason] = useState('')
  const [cascadeToChildren, setCascadeToChildren] = useState(false)

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) {
          if (!nextOpen) {
            setReason('')
            setCascadeToChildren(false)
          }
          onOpenChange(nextOpen)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            {isReactivation ? <RotateCcw aria-hidden="true" /> : <CircleOff aria-hidden="true" />}
          </AlertDialogMedia>
          <AlertDialogTitle>
            {isReactivation ? 'Kích hoạt lại' : 'Ngừng hoạt động'} {locationLabel}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {locationLabel}{' '}
            <span translate="no" className="font-mono">
              {locationCode}
            </span>{' '}
            {isReactivation
              ? ' sẽ hoạt động trở lại sau khi hệ thống kiểm tra các cấp cha.'
              : ' sẽ ngừng nhận cấu hình mới. Thao tác bị chặn nếu vị trí này hoặc các vị trí con còn hàng, lượng giữ hoặc công việc đang xử lý.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertTitle>
              {isReactivation ? 'Chưa thể kích hoạt lại' : 'Chưa thể ngừng hoạt động'}
            </AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {!isReactivation && cascadeDescription ? (
          <div className="flex items-start gap-3 border p-3">
            <Checkbox
              id="cascade-location-lifecycle"
              checked={cascadeToChildren}
              disabled={isPending}
              onCheckedChange={(checked) => setCascadeToChildren(checked === true)}
            />
            <div className="grid gap-1">
              <Label htmlFor="cascade-location-lifecycle">
                Đồng thời ngừng các vị trí con đang hoạt động
              </Label>
              <p className="text-muted-foreground text-xs">{cascadeDescription}</p>
              <p className="text-muted-foreground text-xs">
                Hệ thống sẽ kiểm tra toàn bộ trước và không thay đổi gì nếu còn hàng, lượng giữ hoặc
                nghiệp vụ đang xử lý.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="location-lifecycle-reason">Lý do (không bắt buộc)</Label>
          <Textarea
            id="location-lifecycle-reason"
            name="locationLifecycleReason"
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
            variant={isReactivation ? 'default' : 'destructive'}
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirm(reason.trim() || null, cascadeToChildren)
            }}
          >
            {isPending ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : isReactivation ? (
              <RotateCcw data-icon="inline-start" aria-hidden="true" />
            ) : (
              <CircleOff data-icon="inline-start" aria-hidden="true" />
            )}
            {isReactivation ? 'Xác nhận kích hoạt' : 'Xác nhận ngừng'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
