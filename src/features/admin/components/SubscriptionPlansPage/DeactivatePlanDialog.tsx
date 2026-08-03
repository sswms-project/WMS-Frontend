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
} from '@/components/ui/alert-dialog'
import { useDeactivateSubscriptionPlanMutation } from '../../hooks/use-admin'
import type { SubscriptionPlanResponse } from '../../types/admin.types'
import { isActiveSubscribersError } from './subscription-plan-errors'

interface DeactivatePlanDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly plan: SubscriptionPlanResponse
}

export function DeactivatePlanDialog({ open, onOpenChange, plan }: DeactivatePlanDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const deactivateMutation = useDeactivateSubscriptionPlanMutation()

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && deactivateMutation.isPending) return

    setErrorMessage(null)
    if (!nextOpen) deactivateMutation.reset()
    onOpenChange(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        onEscapeKeyDown={(event) => {
          if (deactivateMutation.isPending) event.preventDefault()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Vô hiệu hóa gói &ldquo;{plan.planName}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            Gói sẽ chuyển sang trạng thái không hoạt động và biến mất khỏi danh sách hiện tại. Giao
            diện hiện chưa hỗ trợ kích hoạt lại gói.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <p role="alert" className="text-destructive text-xs">
            {errorMessage}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deactivateMutation.isPending}>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deactivateMutation.isPending}
            onClick={(event) => {
              // Chặn hành vi đóng mặc định của Radix: chỉ đóng khi API thành công.
              event.preventDefault()
              setErrorMessage(null)
              deactivateMutation.mutate(plan.id, {
                onSuccess: () => onOpenChange(false),
                onError: (error) => {
                  setErrorMessage(
                    isActiveSubscribersError(error)
                      ? 'Không thể vô hiệu hóa gói đang có tenant sử dụng.'
                      : (error.message ?? 'Không thể vô hiệu hóa gói. Vui lòng thử lại.')
                  )
                },
              })
            }}
          >
            {deactivateMutation.isPending ? 'Đang xử lý...' : 'Vô hiệu hóa gói'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
