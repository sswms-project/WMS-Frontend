import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface UnsavedChangesDialogProps {
  readonly open: boolean
  readonly saving: boolean
  readonly saveDisabled?: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: () => void
  readonly onDiscard: () => void
}

export function UnsavedChangesDialog({
  open,
  saving,
  saveDisabled,
  onOpenChange,
  onSave,
  onDiscard,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-warning-container text-warning">
            <AlertTriangle aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Bạn có thay đổi chưa lưu</AlertDialogTitle>
          <AlertDialogDescription>
            Lưu quyền vừa chỉnh trước khi chuyển lựa chọn hoặc rời khỏi trang này.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Ở lại</AlertDialogCancel>
          <Button type="button" variant="outline" disabled={saving} onClick={onDiscard}>
            Bỏ thay đổi
          </Button>
          <Button type="button" disabled={saving || saveDisabled} onClick={onSave}>
            {saving && <Spinner data-icon="inline-start" aria-hidden="true" />}
            {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
