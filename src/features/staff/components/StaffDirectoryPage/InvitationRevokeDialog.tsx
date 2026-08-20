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
          <AlertDialogMedia>
            <MailX className="text-destructive" aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Thu hồi lời mời?</AlertDialogTitle>
          <AlertDialogDescription>
            Lời mời gửi đến <strong>{invitation.email}</strong> sẽ bị hủy và không thể sử dụng.
          </AlertDialogDescription>
        </AlertDialogHeader>
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
            {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            Thu hồi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
