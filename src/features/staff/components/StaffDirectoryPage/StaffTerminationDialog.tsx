import { LoaderCircle, UserRoundX } from 'lucide-react'
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

interface StaffTerminationDialogProps {
  readonly person: StaffResponse
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function StaffTerminationDialog({
  person,
  isPending,
  onOpenChange,
  onConfirm,
}: StaffTerminationDialogProps) {
  return (
    <AlertDialog open onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <UserRoundX className="text-destructive" aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Chấm dứt làm việc</AlertDialogTitle>
          <AlertDialogDescription>
            Xác nhận xóa quyền truy cập của nhân viên khỏi tổ chức hiện tại.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="border-border bg-muted flex flex-col gap-3 border p-3 text-sm">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="text-muted-foreground">Nhân viên</dt>
            <dd className="font-medium">{person.fullName}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium break-all">{person.email}</dd>
          </dl>
          <div>
            <p className="font-medium">Sau khi xác nhận:</p>
            <ul className="text-muted-foreground mt-1 list-disc pl-5 text-xs leading-5">
              <li>Nhân viên không còn truy cập tổ chức hiện tại.</li>
              <li>Tất cả phiên đăng nhập bị thu hồi.</li>
              <li>Phân công kho và quyền cá nhân bị hủy.</li>
            </ul>
          </div>
        </div>

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
            {isPending && (
              <LoaderCircle
                data-icon="inline-start"
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            )}
            Xác nhận chấm dứt
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
