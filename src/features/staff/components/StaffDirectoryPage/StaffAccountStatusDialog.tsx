import { LoaderCircle, LockKeyhole, LockKeyholeOpen } from 'lucide-react'
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
import type { StaffResponse } from '../../types/staff.types'

interface StaffAccountStatusDialogProps {
  readonly person: StaffResponse
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function StaffAccountStatusDialog({
  person,
  isPending,
  onOpenChange,
  onConfirm,
}: StaffAccountStatusDialogProps) {
  const isLocking = person.status === 'Active'
  const Icon = isLocking ? LockKeyhole : LockKeyholeOpen
  const title = isLocking ? 'Khóa tài khoản' : 'Mở khóa tài khoản'

  return (
    <AlertDialog open onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon className={isLocking ? 'text-destructive' : 'text-primary'} aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {isLocking
              ? 'Nhân sự sẽ không thể đăng nhập cho đến khi tài khoản được mở khóa.'
              : 'Nhân sự có thể đăng nhập lại và sử dụng các quyền hiện có.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="border-border bg-muted border p-3 text-sm">
          <p className="font-medium">{person.fullName}</p>
          <p className="text-muted-foreground mt-1 text-xs break-all">{person.email}</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant={isLocking ? 'destructive' : 'default'}
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            {isLocking ? 'Xác nhận khóa' : 'Xác nhận mở khóa'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
