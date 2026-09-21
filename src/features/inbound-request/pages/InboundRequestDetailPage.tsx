'use client'

import { toast } from 'sonner'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { logger } from '@/lib/logger'
import { InboundRequestDetail } from '../components/InboundRequestDetailPage'
import {
  useApproveInboundRequestMutation,
  useInboundRequestAllowedActionsQuery,
  useInboundRequestQuery,
  useRejectInboundRequestMutation,
  useSubmitInboundRequestMutation,
} from '../hooks/use-inbound-requests'

export default function InboundRequestDetailPage({
  inboundRequestId,
}: {
  readonly inboundRequestId: string
}) {
  const detailQuery = useInboundRequestQuery(inboundRequestId)
  const actionsQuery = useInboundRequestAllowedActionsQuery(inboundRequestId)
  const submitMutation = useSubmitInboundRequestMutation()
  const approveMutation = useApproveInboundRequestMutation()
  const rejectMutation = useRejectInboundRequestMutation()

  async function runAction(action: 'submit' | 'approve', reason?: string) {
    try {
      if (action === 'submit') await submitMutation.mutateAsync(inboundRequestId)
      else if (reason) await rejectMutation.mutateAsync({ inboundRequestId, reason })
      else await approveMutation.mutateAsync(inboundRequestId)
      toast.success(
        action === 'submit'
          ? 'Đã gửi yêu cầu nhập kho để duyệt.'
          : reason
            ? 'Đã trả yêu cầu nhập kho để chỉnh sửa.'
            : 'Đã phê duyệt yêu cầu nhập kho.'
      )
      return true
    } catch (error) {
      logger.error(error)
      toast.error('Không thể cập nhật yêu cầu nhập kho. Vui lòng thử lại.')
      return false
    }
  }

  if (detailQuery.isLoading || actionsQuery.isLoading) return <OperationalLoadingState rows={8} />
  if (detailQuery.isError || actionsQuery.isError || !detailQuery.data)
    return (
      <OperationalErrorState
        title="Không thể tải chi tiết yêu cầu nhập kho"
        onRetry={() => {
          void detailQuery.refetch()
          void actionsQuery.refetch()
        }}
      />
    )

  return (
    <InboundRequestDetail
      inboundRequest={detailQuery.data}
      allowedActions={actionsQuery.data?.allowedActions ?? []}
      isPending={submitMutation.isPending || approveMutation.isPending || rejectMutation.isPending}
      onSubmit={() => runAction('submit')}
      onApprove={() => runAction('approve')}
      onReject={(reason) => runAction('approve', reason)}
    />
  )
}
