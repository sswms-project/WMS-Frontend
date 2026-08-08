import { LoaderCircle, UserRoundCheck, UserRoundX } from 'lucide-react'
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
import type { StaffLifecycleAction, StaffResponse } from '../../types/staff.types'

interface StaffLifecycleDialogProps {
  readonly person: StaffResponse
  readonly action: StaffLifecycleAction
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function StaffLifecycleDialog({
  person,
  action,
  isPending,
  onOpenChange,
  onConfirm,
}: StaffLifecycleDialogProps) {
  const isDeactivate = action === 'deactivate'
  const Icon = isDeactivate ? UserRoundX : UserRoundCheck

  return (
    <AlertDialog open onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon
              className={isDeactivate ? 'text-destructive' : 'text-primary'}
              aria-hidden="true"
            />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {isDeactivate ? 'Vô hiệu hóa tài khoản?' : 'Kích hoạt lại tài khoản?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Thao tác này thay đổi trạng thái tài khoản của <strong>{person.fullName}</strong> trên
            toàn tổ chức, không chỉ ở một warehouse.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant={isDeactivate ? 'destructive' : 'default'}
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            {isDeactivate ? 'Vô hiệu hóa' : 'Kích hoạt lại'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
