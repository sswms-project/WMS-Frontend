'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useUploadInventoryEvidenceMutation } from '@/features/inventory/hooks/use-inventory'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { useWarehouseLayoutQuery } from '@/features/warehouse/hooks/use-warehouse'
import { logger } from '@/lib/logger'
import { getApiErrorMessage, isApiErrorResponse } from '@/lib/api-error'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  CancelPutawayDialog,
  PutawayForm,
  type PutawayEvidenceState,
  type SlotOption,
} from '../components/PutawayDetailPage'
import { PutawayPlanSheet } from '../components/ReceiptDetailPage'
import { usePutawayFormSuggestions } from '../hooks/use-putaway-form-suggestions'
import { usePutawayPlanEditor } from '../hooks/use-putaway-plan-editor'
import {
  useCancelPutawayTaskMutation,
  useGoodsReceiptQuery,
  useInboundAllowedActionsQuery,
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
import {
  buildPlannedAllocations,
  getPutawayEvidenceError,
  getPutawayPlanDeviation,
  isPutawayReasonValid,
  type PutawayPlanDeviation,
} from '../utils/putaway-plan'

const EMPTY_ALLOCATION = {
  goodsReceiptItemId: '',
  slotId: '',
  enteredQuantity: 1,
  enteredUnitId: '',
}

const NO_DEVIATION: PutawayPlanDeviation = { offPlanRows: new Set<number>(), requiresReason: false }

interface EvidenceFile {
  readonly id: string
  readonly fileName: string
}

// Điền sẵn theo kế hoạch của quản lý (nếu có); dòng chưa có kế hoạch để trống vị trí.
function buildInitialAllocations(receipt: GoodsReceiptDetail): PutawayFormValues['lines'] {
  const lines = receipt.items
    .filter((item) => item.inboundRequestItemId && item.remainingPutAwayQuantity > 0)
    .flatMap(buildPlannedAllocations)
  return lines.length > 0 ? lines : [EMPTY_ALLOCATION]
}

export default function InboundPutawayDetailPage({ receiptId }: { readonly receiptId: string }) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [hasUncertainSubmission, setHasUncertainSubmission] = useState(false)
  const [evidenceFiles, setEvidenceFiles] = useState<readonly EvidenceFile[]>([])
  const [evidenceError, setEvidenceError] = useState<string | null>(null)
  const pendingRequest = useRef<{ receiptId: string; request: PutawayRequest } | null>(null)
  const submitting = useRef(false)
  const meQuery = useMeQuery()
  const receiptQuery = useGoodsReceiptQuery(receiptId)
  const allowedActionsQuery = useInboundAllowedActionsQuery(receiptId)
  const planEditor = usePutawayPlanEditor(receiptQuery.data)
  const layoutQuery = useWarehouseLayoutQuery(
    receiptQuery.data?.warehouseId ?? '',
    Boolean(receiptQuery.data?.warehouseId)
  )
  const mutation = usePutawayMutation()
  const uploadEvidenceMutation = useUploadInventoryEvidenceMutation()
  const cancelMutation = useCancelPutawayTaskMutation()
  const reconcileMutation = useReconcilePutawayCancellationMutation()
  const form = useForm<PutawayFormValues>({
    resolver: zodResolver(putawaySchema),
    mode: 'onChange',
    defaultValues: { lines: [EMPTY_ALLOCATION] },
    // Điền sẵn dòng cho phần còn phải cất; keepDirtyValues giữ lại những gì người dùng đã sửa khi refetch.
    values: receiptQuery.data
      ? { lines: buildInitialAllocations(receiptQuery.data), overrideReason: '' }
      : undefined,
    resetOptions: { keepDirtyValues: true },
  })
  const fieldArray = useFieldArray({ control: form.control, name: 'lines' })
  const cancelForm = useForm<CancelPutawayTaskFormValues>({
    resolver: zodResolver(cancelPutawayTaskSchema),
    defaultValues: { reason: '', hasUnrecordedPhysicalMovement: false },
  })
  const slots: SlotOption[] = getPutawaySlotOptions(layoutQuery.data ?? [])
  const suggestion = usePutawayFormSuggestions({
    receipt: receiptQuery.data,
    form,
    append: fieldArray.append,
    slots,
  })
  const watchedLines = useWatch({ control: form.control, name: 'lines' })
  const planDeviation = receiptQuery.data
    ? getPutawayPlanDeviation(
        watchedLines,
        getPutawayAllocationState(watchedLines, receiptQuery.data.items, slots).rows.map(
          (row) => row.baseQuantity
        ),
        receiptQuery.data.items
      )
    : NO_DEVIATION

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
      const deviation = getPutawayPlanDeviation(
        values.lines,
        allocation.rows.map((row) => row.baseQuantity),
        receipt.items
      )
      const reason = (values.overrideReason ?? '').trim()
      if (deviation.requiresReason && !isPutawayReasonValid(reason)) {
        toast.error('Vui lòng nhập lý do khi cất khác kế hoạch của quản lý.')
        return
      }
      pendingRequest.current = {
        receiptId,
        request: {
          lines: values.lines.map(
            ({ goodsReceiptItemId, slotId, enteredQuantity, enteredUnitId }) => ({
              goodsReceiptItemId,
              slotId,
              enteredQuantity,
              enteredUnitId,
            })
          ),
          expectedVersion: receipt.version,
          commandId: crypto.randomUUID(),
          ...(deviation.requiresReason
            ? {
                overrideReason: reason,
                ...(evidenceFiles.length > 0
                  ? { evidenceIds: evidenceFiles.map((file) => file.id) }
                  : {}),
              }
            : {}),
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

  async function addEvidence(file: File) {
    const receipt = receiptQuery.data
    if (!receipt) return
    const message = getPutawayEvidenceError(file, evidenceFiles.length)
    setEvidenceError(message)
    if (message) return
    try {
      const response = await uploadEvidenceMutation.mutateAsync({
        warehouseId: receipt.warehouseId,
        file,
      })
      setEvidenceFiles((files) => [
        ...files,
        { id: response.data.id, fileName: response.data.fileName },
      ])
    } catch (error) {
      setEvidenceError(getApiErrorMessage(error, 'Không thể tải ảnh lên. Vui lòng thử lại.'))
    }
  }

  function applyPlan(receipt: GoodsReceiptDetail) {
    fieldArray.replace(buildInitialAllocations(receipt))
    form.setValue('overrideReason', '')
    setEvidenceFiles([])
    setEvidenceError(null)
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
  const evidence: PutawayEvidenceState = {
    items: evidenceFiles,
    isUploading: uploadEvidenceMutation.isPending,
    error: evidenceError,
    onAdd: (file) => void addEvidence(file),
    onRemove: (id) => setEvidenceFiles((files) => files.filter((file) => file.id !== id)),
  }
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
        planDeviation={planDeviation}
        evidence={evidence}
        suggestion={suggestion}
        canPlan={allowedActionsQuery.data?.allowedActions.includes('PlanPutAway') ?? false}
        onPlan={planEditor.open}
        canCancel={canCancel}
        cancelLabel={
          receipt.putAwayTaskRequiresReconciliation ? 'Hoàn tất đối soát hủy' : 'Hủy phần còn lại'
        }
        onCancel={() => setCancelOpen(true)}
        onApplyPlan={() => applyPlan(receipt)}
        onAdd={() => fieldArray.append(EMPTY_ALLOCATION)}
        onRemove={fieldArray.remove}
        onSubmit={() =>
          hasUncertainSubmission ? void submit(form.getValues()) : void form.handleSubmit(submit)()
        }
      />
      <PutawayPlanSheet
        open={planEditor.isOpen}
        receiptCode={receipt.receiptCode}
        items={planEditor.plannableItems}
        slots={planEditor.slots}
        drafts={planEditor.drafts}
        validation={planEditor.validation}
        suggestions={planEditor.suggestions}
        isLoadingSlots={planEditor.isLoadingSlots}
        isSlotsError={planEditor.isSlotsError}
        isSuggesting={planEditor.isSuggesting}
        isSaving={planEditor.isSaving}
        onOpenChange={(open) => !open && planEditor.close()}
        onRetrySlots={planEditor.retrySlots}
        onAddLine={planEditor.addLine}
        onChangeLine={planEditor.updateLine}
        onRemoveLine={planEditor.removeLine}
        onFillRemaining={planEditor.fillRemaining}
        onSuggest={() => void planEditor.suggest()}
        onApplySuggestion={planEditor.applySuggestion}
        onApplyBestSuggestions={planEditor.applyBestSuggestions}
        onSave={() => void planEditor.save()}
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
