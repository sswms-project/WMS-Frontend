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
import type { ReactNode } from 'react'

interface SubscriptionActionDialogProps {
  readonly open: boolean
  readonly title: string
  readonly description: string
  readonly confirmLabel: string
  readonly isPending: boolean
  readonly variant?: 'default' | 'destructive'
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
  readonly children?: ReactNode
}

export function SubscriptionActionDialog({
  open,
  title,
  description,
  confirmLabel,
  isPending,
  variant = 'default',
  onOpenChange,
  onConfirm,
  children,
}: SubscriptionActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Đóng</AlertDialogCancel>
          <Button type="button" variant={variant} disabled={isPending} onClick={onConfirm}>
            {isPending ? 'Đang xử lý...' : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
