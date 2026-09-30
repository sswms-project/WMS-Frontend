'use client'

import { toast } from 'sonner'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { logger } from '@/lib/logger'
import { InboundRequestDetail } from '../components/InboundRequestDetailPage'
import {
  useApproveAndSendInboundRequestMutation,
  useApproveInboundRequestMutation,
  useInboundRequestAllowedActionsQuery,
  useInboundRequestQuery,
  useRejectInboundRequestMutation,
  useSendInboundRequestToSupplierMutation,
  useSubmitInboundRequestMutation,
} from '../hooks/use-inbound-requests'
import {
  INBOUND_REQUEST_ACTION,
  type InboundRequestAction,
  type SupplierEmailDispatch,
} from '../types/inbound-request.types'

function notifyDispatch(dispatch: SupplierEmailDispatch, approvedNow: boolean) {
  if (dispatch.sent) {
    toast.success(
      approvedNow
        ? `Đã duyệt và gửi email đơn hàng tới ${dispatch.sentTo}.`
        : `Đã gửi email đơn hàng tới ${dispatch.sentTo}.`
    )
    return
  }
  const reason = dispatch.error ?? 'Không thể gửi email cho nhà cung cấp.'
  if (approvedNow) toast.warning(`Đã duyệt yêu cầu nhưng chưa gửi được email. ${reason}`)
  else toast.error(reason)
}

export default function InboundRequestDetailPage({
  inboundRequestId,
}: {
  readonly inboundRequestId: string
}) {
  const detailQuery = useInboundRequestQuery(inboundRequestId)
  const actionsQuery = useInboundRequestAllowedActionsQuery(inboundRequestId)
  const submitMutation = useSubmitInboundRequestMutation()
  const approveMutation = useApproveInboundRequestMutation()
  const approveAndSendMutation = useApproveAndSendInboundRequestMutation()
  const sendToSupplierMutation = useSendInboundRequestToSupplierMutation()
  const rejectMutation = useRejectInboundRequestMutation()

  async function runAction(action: InboundRequestAction, reason?: string) {
    try {
      if (
        action === INBOUND_REQUEST_ACTION.ApproveAndSend ||
        action === INBOUND_REQUEST_ACTION.SendToSupplier
      ) {
        const approvedNow = action === INBOUND_REQUEST_ACTION.ApproveAndSend
        const response = approvedNow
          ? await approveAndSendMutation.mutateAsync(inboundRequestId)
          : await sendToSupplierMutation.mutateAsync(inboundRequestId)
        notifyDispatch(response.data, approvedNow)
        return approvedNow || response.data.sent
      }
      if (action === INBOUND_REQUEST_ACTION.Submit)
        await submitMutation.mutateAsync(inboundRequestId)
      else if (action === INBOUND_REQUEST_ACTION.Reject) {
        if (!reason) return false
        await rejectMutation.mutateAsync({ inboundRequestId, reason })
      } else await approveMutation.mutateAsync(inboundRequestId)
      toast.success(
        action === INBOUND_REQUEST_ACTION.Submit
          ? 'Đã gửi yêu cầu nhập kho để duyệt.'
          : action === INBOUND_REQUEST_ACTION.Reject
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
      isPending={
        submitMutation.isPending ||
        approveMutation.isPending ||
        approveAndSendMutation.isPending ||
        sendToSupplierMutation.isPending ||
        rejectMutation.isPending
      }
      onSubmit={() => runAction(INBOUND_REQUEST_ACTION.Submit)}
      onApprove={() => runAction(INBOUND_REQUEST_ACTION.Approve)}
      onApproveAndSend={() => runAction(INBOUND_REQUEST_ACTION.ApproveAndSend)}
      onSendToSupplier={() => runAction(INBOUND_REQUEST_ACTION.SendToSupplier)}
      onReject={(reason) => runAction(INBOUND_REQUEST_ACTION.Reject, reason)}
    />
  )
}
