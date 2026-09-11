import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface ResetUserPermissionsDialogProps {
  readonly open: boolean
  readonly name: string
  readonly role: string
  readonly pending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function ResetUserPermissionsDialog({
  open,
  name,
  role,
  pending,
  onOpenChange,
  onConfirm,
}: ResetUserPermissionsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Khôi phục quyền mặc định?</AlertDialogTitle>
          <AlertDialogDescription>
            {name} sẽ nhận quyền theo vai trò {role}. Mọi tùy chỉnh cá nhân sẽ bị xóa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
          <Button type="button" disabled={pending} onClick={onConfirm}>
            {pending && <Spinner data-icon="inline-start" aria-hidden="true" />}
            {pending ? 'Đang khôi phục…' : 'Khôi phục'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
