'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { useWarehouseLayoutQuery } from '@/features/warehouse/hooks/use-warehouse'
import { logger } from '@/lib/logger'
import { APP_ROUTES } from '@/routes/app-routes'
import { PutawayForm, type SlotOption } from '../components/PutawayDetailPage'
import { useInboundReceiptQuery, usePutawayMutation } from '../hooks/use-inbound'
import { putawaySchema, type PutawayFormValues } from '../schemas/inbound.schema'

const EMPTY_ALLOCATION = { inboundReceiptItemId: '', slotId: '', quantity: 1 }

export default function InboundPutawayDetailPage({ receiptId }: { readonly receiptId: string }) {
  const router = useRouter()
  const receiptQuery = useInboundReceiptQuery(receiptId)
  const layoutQuery = useWarehouseLayoutQuery(
    receiptQuery.data?.warehouseId ?? '',
    Boolean(receiptQuery.data?.warehouseId)
  )
  const mutation = usePutawayMutation()
  const form = useForm<PutawayFormValues>({
    resolver: zodResolver(putawaySchema),
    defaultValues: { lines: [EMPTY_ALLOCATION] },
  })
  const fieldArray = useFieldArray({ control: form.control, name: 'lines' })
  const slots: SlotOption[] = (layoutQuery.data ?? []).flatMap((zone) =>
    zone.status === 'Active'
      ? zone.racks.flatMap((rack) =>
          rack.status === 'Active'
            ? rack.slots
                .filter((slot) => slot.isActive && slot.capacity > slot.currentOccupancy)
                .map((slot) => ({
                  id: slot.id,
                  code: slot.slotCode,
                  hierarchy: `${zone.zoneCode} / ${rack.rackCode}`,
                  availableCapacity: slot.capacity - slot.currentOccupancy,
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
        line.inboundReceiptItemId,
        (quantitiesByItem.get(line.inboundReceiptItemId) ?? 0) + line.quantity
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
      router.push(APP_ROUTES.inboundReceiptDetail(receiptId) as Route)
    } catch (error) {
      logger.error(error)
      toast.error('Không thể cất hàng. Dữ liệu vị trí có thể đã thay đổi, vui lòng tải lại.')
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
  return (
    <PutawayForm
      receipt={receiptQuery.data}
      form={form}
      fields={fieldArray.fields}
      slots={slots}
      isPending={mutation.isPending}
      onAdd={() => fieldArray.append(EMPTY_ALLOCATION)}
      onRemove={fieldArray.remove}
      onSubmit={() => void form.handleSubmit(submit)()}
    />
  )
}
