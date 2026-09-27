'use client'

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

interface StatusChangeDialogProps {
  readonly open: boolean
  readonly subject: string
  readonly nextStatus: 'Active' | 'Inactive'
  readonly inactiveActionLabel?: string
  readonly activeActionLabel?: string
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function StatusChangeDialog({
  open,
  subject,
  nextStatus,
  inactiveActionLabel = 'Ngừng hoạt động',
  activeActionLabel = 'Kích hoạt lại',
  isPending,
  onOpenChange,
  onConfirm,
}: StatusChangeDialogProps) {
  const isDeactivate = nextStatus === 'Inactive'
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDeactivate
              ? `${inactiveActionLabel} ${subject}?`
              : `${activeActionLabel} ${subject}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDeactivate
              ? `${subject} sẽ không thể được chọn cho dữ liệu hoặc nghiệp vụ mới. Lịch sử hiện có vẫn được giữ nguyên.`
              : `${subject} sẽ có thể được chọn lại cho dữ liệu hoặc nghiệp vụ mới.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={onConfirm}>
            {isPending ? 'Đang xử lý…' : isDeactivate ? inactiveActionLabel : activeActionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
