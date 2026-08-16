'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useTwoFactorDisableMutation } from '../../hooks/use-two-factor'

export function DisableTwoFactorDialog() {
  const [open, setOpen] = useState(false)
  const disableMutation = useTwoFactorDisableMutation()

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && disableMutation.isPending) return
    setOpen(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 h-9 rounded-lg px-4.5 text-[13px] font-semibold"
        >
          Tắt xác thực hai yếu tố
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (disableMutation.isPending) event.preventDefault()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Tắt xác thực hai yếu tố?</AlertDialogTitle>
          <AlertDialogDescription>
            Tài khoản sẽ không còn yêu cầu mã OTP khi đăng nhập. Bạn có thể bật lại bất cứ lúc nào.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disableMutation.isPending}>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={disableMutation.isPending}
            onClick={(event) => {
              event.preventDefault()
              disableMutation.mutate(undefined, {
                onSuccess: () => setOpen(false),
              })
            }}
          >
            {disableMutation.isPending ? 'Đang tắt...' : 'Tắt xác thực hai yếu tố'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
