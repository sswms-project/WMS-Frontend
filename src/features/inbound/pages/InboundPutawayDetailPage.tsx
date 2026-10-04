'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
import { getApiErrorMessage, isApiErrorResponse } from '@/lib/api-error'
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
import { getPutawayAllocationState } from '../schemas/putaway-allocation.schema'
import type { GoodsReceiptDetail, PutawayRequest } from '../types/inbound.types'
import { getPutawaySlotOptions } from '../utils/putaway-slot-options'
import { getPutawayRemainingInput } from '../utils/putaway-units'

const EMPTY_ALLOCATION = {
  goodsReceiptItemId: '',
  slotId: '',
  enteredQuantity: 1,
  enteredUnitId: '',
}

function buildInitialAllocations(receipt: GoodsReceiptDetail): PutawayFormValues['lines'] {
  const lines = receipt.items
    .filter((item) => item.inboundRequestItemId && item.remainingPutAwayQuantity > 0)
    .map((item) => ({
      goodsReceiptItemId: item.id,
      slotId: '',
      ...(getPutawayRemainingInput(item, item.remainingPutAwayQuantity) ?? {
        enteredQuantity: item.remainingPutAwayQuantity,
        enteredUnitId: '',
      }),
    }))
  return lines.length > 0 ? lines : [EMPTY_ALLOCATION]
}

export default function InboundPutawayDetailPage({ receiptId }: { readonly receiptId: string }) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [hasUncertainSubmission, setHasUncertainSubmission] = useState(false)
  const pendingRequest = useRef<{ receiptId: string; request: PutawayRequest } | null>(null)
  const submitting = useRef(false)
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
    mode: 'onChange',
    defaultValues: { lines: [EMPTY_ALLOCATION] },
    // Điền sẵn dòng cho phần còn phải cất; keepDirtyValues giữ lại những gì người dùng đã sửa khi refetch.
    values: receiptQuery.data ? { lines: buildInitialAllocations(receiptQuery.data) } : undefined,
    resetOptions: { keepDirtyValues: true },
  })
  const fieldArray = useFieldArray({ control: form.control, name: 'lines' })
  const cancelForm = useForm<CancelPutawayTaskFormValues>({
    resolver: zodResolver(cancelPutawayTaskSchema),
    defaultValues: { reason: '', hasUnrecordedPhysicalMovement: false },
  })
  const slots: SlotOption[] = getPutawaySlotOptions(layoutQuery.data ?? [])

  useEffect(() => {
    if (!hasUncertainSubmission && !mutation.isPending) return
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [hasUncertainSubmission, mutation.isPending])

  async function submit(values: PutawayFormValues) {
    if (submitting.current) return
    const receipt = receiptQuery.data
    if (!receipt) return
    if (!pendingRequest.current) {
      const allocation = getPutawayAllocationState(values.lines, receipt.items, slots)
      if (!allocation.canSubmit) {
        toast.error('Phân bổ chưa hợp lệ. Vui lòng kiểm tra lỗi tại từng dòng.')
        return
      }
      pendingRequest.current = {
        receiptId,
        request: {
          lines: values.lines.map((line) => ({ ...line })),
          expectedVersion: receipt.version,
          commandId: crypto.randomUUID(),
        },
      }
    }
    // A lost response is not a failed write. Retry the exact command before validating new stock.
    submitting.current = true
    const command = pendingRequest.current
    try {
      await mutation.mutateAsync(command)
      pendingRequest.current = null
      setHasUncertainSubmission(false)
      toast.success('Đã ghi nhận cất hàng vào vị trí lưu trữ.')
      router.push(APP_ROUTES.goodsReceiptDetail(command.receiptId) as Route)
    } catch (error) {
      logger.warn(getApiErrorMessage(error))
      const rejected =
        !hasUncertainSubmission &&
        isApiErrorResponse(error) &&
        [400, 401, 403, 404, 409, 422].includes(error.statusCode)
      if (rejected) pendingRequest.current = null
      else setHasUncertainSubmission(true)
      const message = rejected
        ? getApiErrorMessage(error, 'Không thể cất hàng. Vui lòng tải lại dữ liệu.')
        : 'Chưa xác định kết quả cất hàng. Không cất lại hàng hoặc rời màn hình. Bấm Gửi lại an toàn để kiểm tra đúng thao tác ban đầu; nếu vẫn lỗi, liên hệ quản lý để đối soát.'
      form.setError('root.server', {
        message,
      })
      toast.error(message)
      void receiptQuery.refetch()
      void layoutQuery.refetch()
    } finally {
      submitting.current = false
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
        hasUncertainSubmission={hasUncertainSubmission}
        canCancel={canCancel}
        cancelLabel={
          receipt.putAwayTaskRequiresReconciliation ? 'Hoàn tất đối soát hủy' : 'Hủy phần còn lại'
        }
        onCancel={() => setCancelOpen(true)}
        onAdd={() => fieldArray.append(EMPTY_ALLOCATION)}
        onRemove={fieldArray.remove}
        onSubmit={() =>
          hasUncertainSubmission ? void submit(form.getValues()) : void form.handleSubmit(submit)()
        }
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
