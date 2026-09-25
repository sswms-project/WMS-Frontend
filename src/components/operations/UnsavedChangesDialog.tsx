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

interface UnsavedChangesDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onDiscard: () => void
}

export function UnsavedChangesDialog({ open, onOpenChange, onDiscard }: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bỏ các thay đổi chưa lưu?</AlertDialogTitle>
          <AlertDialogDescription>
            Thông tin vừa nhập sẽ không được lưu. Bạn có thể tiếp tục chỉnh sửa hoặc xác nhận rời
            form.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
          <AlertDialogAction onClick={onDiscard}>Bỏ thay đổi</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
