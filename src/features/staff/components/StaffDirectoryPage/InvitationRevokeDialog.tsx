import { LoaderCircle, MailX } from 'lucide-react'
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
import type { InvitationResponse } from '../../types/invitation.types'

interface InvitationRevokeDialogProps {
  readonly invitation: InvitationResponse
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function InvitationRevokeDialog({
  invitation,
  isPending,
  onOpenChange,
  onConfirm,
}: InvitationRevokeDialogProps) {
  return (
    <AlertDialog open onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <MailX aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Thu hồi lời mời?</AlertDialogTitle>
          <AlertDialogDescription>
            Liên kết đã gửi tới <strong>{invitation.email}</strong> sẽ không còn sử dụng được. Bạn
            có thể tạo lời mời mới sau đó.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="auth" disabled={isPending}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="auth"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {isPending && (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            )}
            Thu hồi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
