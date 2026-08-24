'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { logger } from '@/lib/logger'
import { ReceiptDetail } from '../components/ReceiptDetailPage'
import { ReceiveGoodsDialog } from '../components/ReceivingPage'
import {
  useApproveInboundReceiptMutation,
  useInboundAllowedActionsQuery,
  useInboundReceiptQuery,
  useRejectInboundReceiptMutation,
  useSubmitInboundReceiptMutation,
  useUpdateInboundReceiptMutation,
} from '../hooks/use-inbound'
import { inboundReceiptSchema, type InboundReceiptFormValues } from '../schemas/inbound.schema'
import type { ReceivingTask } from '../types/inbound.types'

export default function InboundReceiptDetailPage({ receiptId }: { readonly receiptId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const detailQuery = useInboundReceiptQuery(receiptId)
  const actionsQuery = useInboundAllowedActionsQuery(receiptId)
  const submitMutation = useSubmitInboundReceiptMutation()
  const approveMutation = useApproveInboundReceiptMutation()
  const rejectMutation = useRejectInboundReceiptMutation()
  const updateMutation = useUpdateInboundReceiptMutation()
  const form = useForm<InboundReceiptFormValues>({
    resolver: zodResolver(inboundReceiptSchema),
    defaultValues: { purchaseOrderId: '', lines: [] },
  })

  function openEditor() {
    const receipt = detailQuery.data
    if (!receipt) return
    form.reset({
      purchaseOrderId: receipt.purchaseOrderId,
      lines: receipt.items.flatMap((item) =>
        item.purchaseOrderItemId
          ? [
              {
                poLineId: item.purchaseOrderItemId,
                receivedQty: item.receivedQuantity,
                damagedQty: item.damagedQuantity,
                exceptionReason: item.exceptionReason ?? '',
              },
            ]
          : []
      ),
    })
    setIsEditing(true)
  }

  async function saveUpdate(values: InboundReceiptFormValues, shouldSubmit: boolean) {
    try {
      await updateMutation.mutateAsync({
        receiptId,
        request: {
          lines: values.lines.map((line) => ({
            ...line,
            exceptionReason: line.exceptionReason.trim() || null,
          })),
        },
      })
      if (shouldSubmit) await submitMutation.mutateAsync(receiptId)
      toast.success(
        shouldSubmit ? 'Đã cập nhật và gửi phiếu nhập để duyệt.' : 'Đã cập nhật phiếu nhập.'
      )
      setIsEditing(false)
    } catch (error) {
      logger.error(error)
      toast.error('Không thể cập nhật phiếu nhập. Vui lòng kiểm tra dữ liệu và thử lại.')
    }
  }

  async function perform(action: 'submit' | 'approve' | 'reject', reason?: string) {
    try {
      if (action === 'submit') await submitMutation.mutateAsync(receiptId)
      else if (action === 'approve') await approveMutation.mutateAsync(receiptId)
      else await rejectMutation.mutateAsync({ receiptId, reason: reason ?? '' })
      toast.success(
        action === 'submit'
          ? 'Đã gửi phiếu nhập để duyệt.'
          : action === 'approve'
            ? 'Đã phê duyệt phiếu nhập.'
            : 'Đã trả phiếu nhập để chỉnh sửa.'
      )
      return true
    } catch (error) {
      logger.error(error)
      toast.error('Không thể cập nhật phiếu nhập. Vui lòng thử lại.')
      return false
    }
  }

  if (detailQuery.isLoading || actionsQuery.isLoading) return <OperationalLoadingState rows={8} />
  if (detailQuery.isError || actionsQuery.isError || !detailQuery.data)
    return (
      <OperationalErrorState
        title="Không thể tải phiếu nhập"
        onRetry={() => {
          void detailQuery.refetch()
          void actionsQuery.refetch()
        }}
      />
    )
  const receipt = detailQuery.data
  const editTask: ReceivingTask = {
    purchaseOrderId: receipt.purchaseOrderId,
    poNumber: receipt.poNumber,
    warehouseId: receipt.warehouseId,
    warehouseName: receipt.warehouseName,
    supplierId: '',
    supplierName: '',
    expectedDate: null,
    orderedQuantity: receipt.items.reduce((sum, item) => sum + item.orderedQuantity, 0),
    receivedQuantity: receipt.items.reduce((sum, item) => sum + item.receivedQuantity, 0),
    remainingQuantity: 0,
    lines: receipt.items.flatMap((item) =>
      item.purchaseOrderItemId
        ? [
            {
              purchaseOrderItemId: item.purchaseOrderItemId,
              productId: item.productId,
              productSKU: item.productSKU,
              productName: item.productName,
              barcodeValue: null,
              orderedQuantity: item.orderedQuantity,
              receivedQuantity: 0,
              remainingQuantity: item.orderedQuantity,
            },
          ]
        : []
    ),
  }
  const isPending =
    submitMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending ||
    updateMutation.isPending

  return (
    <>
      <ReceiptDetail
        receipt={receipt}
        allowedActions={actionsQuery.data?.allowedActions ?? []}
        isPending={isPending}
        onUpdate={openEditor}
        onSubmit={() => perform('submit')}
        onApprove={() => perform('approve')}
        onReject={(reason) => perform('reject', reason)}
      />
      <ReceiveGoodsDialog
        task={isEditing ? editTask : null}
        form={form}
        isPending={isPending}
        title={`Chỉnh sửa ${receipt.receiptCode}`}
        description="Điều chỉnh số lượng thực nhận và tình trạng hàng trước khi gửi duyệt lại."
        saveDraftLabel="Lưu thay đổi"
        mode="edit"
        onOpenChange={(open) => {
          if (!open && !isPending) setIsEditing(false)
        }}
        onSaveDraft={() => void form.handleSubmit((values) => saveUpdate(values, false))()}
        onSaveAndSubmit={() => void form.handleSubmit((values) => saveUpdate(values, true))()}
      />
    </>
  )
}
