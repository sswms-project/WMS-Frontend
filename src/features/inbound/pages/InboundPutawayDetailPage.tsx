'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { useWarehouseLayoutQuery } from '@/features/warehouse/hooks/use-warehouse'
import { logger } from '@/lib/logger'
import { APP_ROUTES } from '@/routes/app-routes'
import { CancelPutawayDialog, PutawayForm, type SlotOption } from '../components/PutawayDetailPage'
import {
  useCancelPutawayTaskMutation,
  useGoodsReceiptQuery,
  usePutawayMutation,
  useReconcilePutawayCancellationMutation,
} from '../hooks/use-inbound'
import {
  cancelPutawayTaskSchema,
  putawaySchema,
  type CancelPutawayTaskFormValues,
  type PutawayFormValues,
} from '../schemas/inbound.schema'

const EMPTY_ALLOCATION = { goodsReceiptItemId: '', slotId: '', quantity: 1 }

export default function InboundPutawayDetailPage({ receiptId }: { readonly receiptId: string }) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const meQuery = useMeQuery()
  const receiptQuery = useGoodsReceiptQuery(receiptId)
  const layoutQuery = useWarehouseLayoutQuery(
    receiptQuery.data?.warehouseId ?? '',
    Boolean(receiptQuery.data?.warehouseId)
  )
  const mutation = usePutawayMutation()
  const cancelMutation = useCancelPutawayTaskMutation()
  const reconcileMutation = useReconcilePutawayCancellationMutation()
  const form = useForm<PutawayFormValues>({
    resolver: zodResolver(putawaySchema),
    defaultValues: { lines: [EMPTY_ALLOCATION] },
  })
  const fieldArray = useFieldArray({ control: form.control, name: 'lines' })
  const cancelForm = useForm<CancelPutawayTaskFormValues>({
    resolver: zodResolver(cancelPutawayTaskSchema),
    defaultValues: { reason: '', hasUnrecordedPhysicalMovement: false },
  })
  const slots: SlotOption[] = (layoutQuery.data ?? []).flatMap((zone) =>
    zone.status === 'Active'
      ? zone.racks.flatMap((rack) =>
          rack.status === 'Active'
            ? rack.slots
                .filter(
                  (slot) =>
                    slot.isActive &&
                    (slot.capacity === null || slot.capacity > slot.currentOccupancy)
                )
                .map((slot) => ({
                  id: slot.id,
                  code: slot.slotCode,
                  hierarchy: `${zone.zoneCode} / ${rack.rackCode}`,
                  availableCapacity:
                    slot.capacity === null
                      ? Number.MAX_SAFE_INTEGER
                      : slot.capacity - slot.currentOccupancy,
                }))
            : []
        )
      : []
  )

  async function submit(values: PutawayFormValues) {
    const receipt = receiptQuery.data
    if (!receipt) return
    const quantitiesByItem = new Map<string, number>()
    for (const line of values.lines)
      quantitiesByItem.set(
        line.goodsReceiptItemId,
        (quantitiesByItem.get(line.goodsReceiptItemId) ?? 0) + line.quantity
      )
    const exceedsReceipt = receipt.items.some(
      (item) => (quantitiesByItem.get(item.id) ?? 0) > item.remainingPutAwayQuantity
    )
    const quantitiesBySlot = new Map<string, number>()
    for (const line of values.lines)
      quantitiesBySlot.set(line.slotId, (quantitiesBySlot.get(line.slotId) ?? 0) + line.quantity)
    const exceedsSlot = slots.some(
      (slot) => (quantitiesBySlot.get(slot.id) ?? 0) > slot.availableCapacity
    )
    if (exceedsReceipt) {
      toast.error('Tổng phân bổ vượt số lượng còn phải cất của sản phẩm.')
      return
    }
    if (exceedsSlot) {
      toast.error('Tổng số lượng phân bổ vượt sức chứa còn lại của vị trí.')
      return
    }
    try {
      await mutation.mutateAsync({ receiptId, request: { lines: values.lines } })
      toast.success('Đã ghi nhận cất hàng vào vị trí lưu trữ.')
      router.push(APP_ROUTES.goodsReceiptDetail(receiptId) as Route)
    } catch (error) {
      logger.error(error)
      toast.error('Không thể cất hàng. Dữ liệu vị trí có thể đã thay đổi, vui lòng tải lại.')
    }
  }

  async function cancelPutaway(values: CancelPutawayTaskFormValues) {
    const receipt = receiptQuery.data
    if (!receipt?.version) {
      toast.error('Nhiệm vụ chưa có phiên bản. Vui lòng tải lại dữ liệu.')
      return
    }
    try {
      if (receipt.putAwayTaskRequiresReconciliation) {
        await reconcileMutation.mutateAsync({
          receiptId,
          request: { note: values.reason.trim(), expectedVersion: receipt.version },
        })
        toast.success('Đã hoàn tất đối soát và đóng phần cất hàng còn lại.')
      } else {
        await cancelMutation.mutateAsync({
          receiptId,
          request: {
            reason: values.reason.trim(),
            expectedVersion: receipt.version,
            commandId: crypto.randomUUID(),
            hasUnrecordedPhysicalMovement: values.hasUnrecordedPhysicalMovement,
          },
        })
        toast.success(
          values.hasUnrecordedPhysicalMovement
            ? 'Nhiệm vụ đã tạm dừng để đối soát hàng đã di chuyển vật lý.'
            : 'Đã hủy phần cất hàng còn lại. Phần đã cất được giữ nguyên.'
        )
      }
      setCancelOpen(false)
      cancelForm.reset()
      if (!values.hasUnrecordedPhysicalMovement || receipt.putAwayTaskRequiresReconciliation)
        router.push(APP_ROUTES.inboundPutaway as Route)
    } catch (error) {
      logger.error(error)
      toast.error('Không thể cập nhật nhiệm vụ. Dữ liệu có thể đã thay đổi, vui lòng tải lại.')
    }
  }

  if (receiptQuery.isLoading || layoutQuery.isLoading) return <OperationalLoadingState rows={8} />
  if (receiptQuery.isError || layoutQuery.isError || !receiptQuery.data)
    return (
      <OperationalErrorState
        title="Không thể chuẩn bị dữ liệu cất hàng"
        onRetry={() => {
          void receiptQuery.refetch()
          void layoutQuery.refetch()
        }}
      />
    )
  const receipt = receiptQuery.data
  const canCancel =
    (meQuery.data?.permissions.includes(P.GOODS_RECEIPTS_APPROVE) ?? false) &&
    receipt.items.some((item) => item.remainingPutAwayQuantity > 0) &&
    !['Completed', 'Cancelled'].includes(receipt.putAwayTaskExecutionStatus)
  return (
    <>
      <PutawayForm
        receipt={receipt}
        form={form}
        fields={fieldArray.fields}
        slots={slots}
        isPending={mutation.isPending || cancelMutation.isPending || reconcileMutation.isPending}
        canCancel={canCancel}
        cancelLabel={
          receipt.putAwayTaskRequiresReconciliation ? 'Hoàn tất đối soát hủy' : 'Hủy phần còn lại'
        }
        onCancel={() => setCancelOpen(true)}
        onAdd={() => fieldArray.append(EMPTY_ALLOCATION)}
        onRemove={fieldArray.remove}
        onSubmit={() => void form.handleSubmit(submit)()}
      />
      <CancelPutawayDialog
        open={cancelOpen}
        isPending={cancelMutation.isPending || reconcileMutation.isPending}
        form={cancelForm}
        mode={receipt.putAwayTaskRequiresReconciliation ? 'reconcile' : 'cancel'}
        onOpenChange={setCancelOpen}
        onSubmit={() => void cancelForm.handleSubmit(cancelPutaway)()}
      />
    </>
  )
}
