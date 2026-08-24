'use client'

import { toast } from 'sonner'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { logger } from '@/lib/logger'
import { PurchaseOrderDetail } from '../components/PurchaseOrderDetailPage'
import {
  useApprovePurchaseOrderMutation,
  usePurchaseOrderAllowedActionsQuery,
  usePurchaseOrderQuery,
  useRejectPurchaseOrderMutation,
  useSubmitPurchaseOrderMutation,
} from '../hooks/use-purchase-orders'

export default function PurchaseOrderDetailPage({
  purchaseOrderId,
}: {
  readonly purchaseOrderId: string
}) {
  const detailQuery = usePurchaseOrderQuery(purchaseOrderId)
  const actionsQuery = usePurchaseOrderAllowedActionsQuery(purchaseOrderId)
  const submitMutation = useSubmitPurchaseOrderMutation()
  const approveMutation = useApprovePurchaseOrderMutation()
  const rejectMutation = useRejectPurchaseOrderMutation()

  async function runAction(action: 'submit' | 'approve', reason?: string) {
    try {
      if (action === 'submit') await submitMutation.mutateAsync(purchaseOrderId)
      else if (reason) await rejectMutation.mutateAsync({ purchaseOrderId, reason })
      else await approveMutation.mutateAsync(purchaseOrderId)
      toast.success(
        action === 'submit'
          ? 'Đã gửi đơn mua để duyệt.'
          : reason
            ? 'Đã trả đơn mua để chỉnh sửa.'
            : 'Đã phê duyệt đơn mua.'
      )
      return true
    } catch (error) {
      logger.error(error)
      toast.error('Không thể cập nhật đơn mua. Vui lòng thử lại.')
      return false
    }
  }

  if (detailQuery.isLoading || actionsQuery.isLoading) return <OperationalLoadingState rows={8} />
  if (detailQuery.isError || actionsQuery.isError || !detailQuery.data)
    return (
      <OperationalErrorState
        title="Không thể tải chi tiết đơn mua"
        onRetry={() => {
          void detailQuery.refetch()
          void actionsQuery.refetch()
        }}
      />
    )

  return (
    <PurchaseOrderDetail
      purchaseOrder={detailQuery.data}
      allowedActions={actionsQuery.data?.allowedActions ?? []}
      isPending={submitMutation.isPending || approveMutation.isPending || rejectMutation.isPending}
      onSubmit={() => runAction('submit')}
      onApprove={() => runAction('approve')}
      onReject={(reason) => runAction('approve', reason)}
    />
  )
}
