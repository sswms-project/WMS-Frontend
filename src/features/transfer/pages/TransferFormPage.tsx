'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { UnsavedChangesDialog } from '@/components/operations/UnsavedChangesDialog'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { Button } from '@/components/ui/button'
import { P } from '@/config/permissionCodes'
import { useProductOptionsQuery } from '@/features/inbound-request/hooks/use-inbound-requests'
import {
  RECORD_STATUS,
  type LookupOption,
} from '@/features/inbound-request/types/inbound-request.types'
import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  TransferForm,
  type TransferFormMode,
  type TransferLineLockInfo,
} from '../components/TransferFormPage'
import { TransferChangedBanner, TransferConfirmDialog } from '../components/TransferShared'
import { useTransferRealtime } from '../hooks/use-transfer-realtime'
import { useTransferViewer } from '../hooks/use-transfer-viewer'
import {
  useSaveTransferDraftMutation,
  useSubmitTransferDraftMutation,
  useTransferAvailabilityQuery,
  useTransferQuery,
  useTransferSourceWarehousesQuery,
  useUpdateTransferMutation,
} from '../hooks/use-transfers'
import {
  transferRequestSchemaWithLocks,
  type TransferLineLock,
  type TransferRequestFormValues,
} from '../schemas/transfer-request.schema'
import { describeTransferError } from '../utils/transfer-errors'
import {
  EMPTY_TRANSFER_LINE,
  dispatchedInEnteredUnit,
  emptyTransferForm,
  toSaveDraftRequest,
  toUpdateTransferRequest,
  transferToFormValues,
  visibleTransferItems,
} from '../utils/transfer-form'

const LOOKUP_PAGE_SIZE = 20

interface ProductSearchState {
  readonly scope: string
  readonly value: string
}

export default function TransferFormPage({ transferId }: { readonly transferId?: string }) {
  const router = useRouter()
  const { viewer, isReady } = useTransferViewer()
  const detailQuery = useTransferQuery(transferId ?? null)
  const detail = detailQuery.data
  const hydratedId = useRef<string | null>(null)
  const draftIdRef = useRef<string | null>(null)
  const savedDraftOnceRef = useRef(false)
  const locksRef = useRef<ReadonlyMap<string, TransferLineLock>>(new Map())
  const [productSearch, setProductSearch] = useState<ProductSearchState | null>(null)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [hasConflict, setHasConflict] = useState(false)
  const debouncedProductSearch = useDebouncedValue(productSearch?.value.trim() ?? '', 300)

  const mode: TransferFormMode = !transferId
    ? 'create'
    : detail?.status === 'Draft'
      ? 'draft'
      : 'edit'

  const form = useForm<TransferRequestFormValues>({
    resolver: (values, context, options) =>
      zodResolver(transferRequestSchemaWithLocks(locksRef.current))(values, context, options),
    defaultValues: emptyTransferForm(),
  })
  const fieldArray = useFieldArray({ control: form.control, name: 'lines' })
  const lines = useWatch({ control: form.control, name: 'lines' })
  const sourceWarehouseId = useWatch({ control: form.control, name: 'sourceWarehouseId' })
  const destinationWarehouseId = useWatch({ control: form.control, name: 'destinationWarehouseId' })

  // Ghi cho màn hình đang nhập dở: chỉ báo thay đổi, không tải đè lên dữ liệu đang nhập.
  const realtime = useTransferRealtime({ transferId: transferId ?? null, autoRefresh: false })

  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })
  const sourceWarehousesQuery = useTransferSourceWarehousesQuery(
    {
      destinationWarehouseId,
      top: 100,
      skip: 0,
      needTotalCount: true,
    },
    Boolean(destinationWarehouseId)
  )
  const productsQuery = useProductOptionsQuery({
    pageNumber: 1,
    pageSize: LOOKUP_PAGE_SIZE,
    status: RECORD_STATUS.Active,
    ...(debouncedProductSearch ? { searchTerm: debouncedProductSearch } : {}),
  })
  const productIds = useMemo(
    () => [...new Set(lines.map((line) => line.productId).filter(Boolean))].sort(),
    [lines]
  )
  const availabilityQuery = useTransferAvailabilityQuery(
    { sourceWarehouseId, destinationWarehouseId, productIds },
    Boolean(
      sourceWarehouseId && destinationWarehouseId && sourceWarehouseId !== destinationWarehouseId
    )
  )

  const saveDraftMutation = useSaveTransferDraftMutation()
  const submitDraftMutation = useSubmitTransferDraftMutation()
  const updateMutation = useUpdateTransferMutation()
  const isSaving =
    saveDraftMutation.isPending || submitDraftMutation.isPending || updateMutation.isPending

  const { lockInfoByItemId, lineLocks } = useMemo(() => {
    const info: Record<string, TransferLineLockInfo> = {}
    const locks = new Map<string, TransferLineLock>()
    for (const item of visibleTransferItems(detail?.items ?? [])) {
      const dispatched = dispatchedInEnteredUnit(item)
      info[item.id] = { dispatched, unitName: item.unitName ?? item.baseUnitName ?? '' }
      if (mode === 'edit' && dispatched > 0) locks.set(item.id, { minimum: dispatched })
    }
    return { lockInfoByItemId: info, lineLocks: locks }
  }, [detail?.items, mode])

  useEffect(() => {
    locksRef.current = lineLocks
  }, [lineLocks])

  const availabilityByProductId = useMemo(
    () =>
      Object.fromEntries((availabilityQuery.data ?? []).map((entry) => [entry.productId, entry])),
    [availabilityQuery.data]
  )
  const knownProductOptions = useMemo(() => {
    const options: Record<string, LookupOption> = {}
    for (const item of detail?.items ?? []) {
      options[item.productId] = {
        value: item.productId,
        label: `${item.sku} - ${item.productName}`,
      }
    }
    for (const entry of availabilityQuery.data ?? []) {
      options[entry.productId] = {
        value: entry.productId,
        label: `${entry.sku} - ${entry.productName}`,
      }
    }
    return options
  }, [availabilityQuery.data, detail?.items])
  const productOptions = useMemo<LookupOption[]>(
    () =>
      (productsQuery.data?.items ?? []).map((product) => ({
        value: product.id,
        label: `${product.sku} - ${product.productName}`,
      })),
    [productsQuery.data?.items]
  )

  const destinationOptions = useMemo(
    () =>
      (warehousesQuery.data?.items ?? []).map((warehouse) => ({
        id: warehouse.id,
        name: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
      })),
    [warehousesQuery.data?.items]
  )
  const sourceOptions = useMemo(() => {
    const options = (sourceWarehousesQuery.data?.items ?? []).map((warehouse) => ({
      id: warehouse.id,
      name: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
    }))
    if (detail && !options.some((option) => option.id === detail.sourceWarehouseId)) {
      options.unshift({ id: detail.sourceWarehouseId, name: detail.sourceWarehouseName })
    }
    return options
  }, [detail, sourceWarehousesQuery.data?.items])

  useEffect(() => {
    if (!detail || hydratedId.current === detail.id) return
    hydratedId.current = detail.id
    draftIdRef.current = detail.status === 'Draft' ? detail.id : null
    form.reset(transferToFormValues(detail))
  }, [detail, form])

  useEffect(() => {
    if (!form.formState.isDirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [form.formState.isDirty])

  const hasShipments = (detail?.shipments ?? []).some((shipment) => shipment.status !== 'Cancelled')
  const warehousesLocked = mode === 'edit' && hasShipments

  function leave() {
    if (form.formState.isDirty) setShowLeaveDialog(true)
    else router.push(transferId ? APP_ROUTES.transferDetail(transferId) : APP_ROUTES.transfers)
  }

  function changeDestination(value: string) {
    form.setValue('destinationWarehouseId', value, { shouldDirty: true, shouldValidate: true })
    form.setValue('sourceWarehouseId', '', { shouldDirty: true })
  }

  function reportError(error: unknown, fallback: string) {
    const description = describeTransferError(error, fallback)
    toast.error(description.message)
    if (description.kind === 'conflict') setHasConflict(true)
  }

  async function reload() {
    const refreshed = await detailQuery.refetch()
    if (refreshed.data) form.reset(transferToFormValues(refreshed.data))
    realtime.dismiss()
    setHasConflict(false)
  }

  async function saveDraft(values: TransferRequestFormValues): Promise<string | null> {
    const expectedVersion =
      mode === 'draft' && !savedDraftOnceRef.current ? (detail?.version ?? null) : null
    const response = await saveDraftMutation.mutateAsync({
      transferId: draftIdRef.current,
      request: toSaveDraftRequest(values, expectedVersion),
    })
    draftIdRef.current = response.data
    savedDraftOnceRef.current = true
    return response.data
  }

  async function handleSaveDraft(values: TransferRequestFormValues) {
    try {
      const id = await saveDraft(values)
      form.reset(values)
      toast.success('Đã lưu nháp. Nháp chưa giữ chỗ tồn kho.')
      if (id && !transferId) router.replace(APP_ROUTES.transferEdit(id))
    } catch (error) {
      reportError(error, 'Không thể lưu nháp.')
    }
  }

  async function handleSubmitRequest(values: TransferRequestFormValues) {
    let draftId: string | null = null
    try {
      draftId = await saveDraft(values)
      if (!draftId) return
      await submitDraftMutation.mutateAsync({
        transferId: draftId,
        request: { expectedVersion: null },
      })
      form.reset(values)
      setIsConfirmOpen(false)
      toast.success('Đã tạo yêu cầu điều chuyển và giữ chỗ tồn kho.')
      router.push(APP_ROUTES.transferDetail(draftId))
    } catch (error) {
      setIsConfirmOpen(false)
      const description = describeTransferError(error, 'Không thể tạo yêu cầu điều chuyển.')
      toast.error(
        draftId ? `Đã lưu nháp nhưng chưa gửi được: ${description.message}` : description.message
      )
      if (description.kind === 'conflict') setHasConflict(true)
    }
  }

  async function handleUpdate(values: TransferRequestFormValues) {
    if (!transferId || !detail?.version) return
    try {
      await updateMutation.mutateAsync({
        transferId,
        request: toUpdateTransferRequest(values, detail, detail.version),
      })
      form.reset(values)
      toast.success('Đã cập nhật yêu cầu điều chuyển.')
      router.push(APP_ROUTES.transferDetail(transferId))
    } catch (error) {
      reportError(error, 'Không thể cập nhật yêu cầu điều chuyển.')
    }
  }

  const submit = form.handleSubmit((values) =>
    mode === 'edit' ? handleUpdate(values) : setIsConfirmOpen(true)
  )

  const canCreate = viewer.permissions.includes(P.TRANSFERS_CREATE)
  const title =
    mode === 'edit'
      ? 'Sửa yêu cầu điều chuyển'
      : mode === 'draft'
        ? 'Soạn tiếp nháp'
        : 'Tạo yêu cầu điều chuyển'
  const unavailable = isReady && !canCreate
  const notEditable =
    Boolean(detail) &&
    (detail?.isLegacyWorkflow || (detail?.status !== 'Draft' && detail?.status !== 'InProgress'))

  const totalBaseQuantity = lines.reduce((sum, line) => {
    const unit = availabilityByProductId[line.productId]?.units.find(
      (candidate) =>
        candidate.unitId === (line.unitId || availabilityByProductId[line.productId]?.baseUnitId)
    )
    return unit && Number.isFinite(line.quantity)
      ? sum + line.quantity * unit.conversionFactor
      : sum
  }, 0)

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4">
      <header className="flex shrink-0 items-start gap-3 border-b pb-4">
        <Button type="button" variant="outline" size="icon" aria-label="Quay lại" onClick={leave}>
          <ArrowLeft aria-hidden="true" />
        </Button>
        <div>
          <p className="text-primary text-xs font-medium">Điều chuyển kho</p>
          <h1 className="text-xl font-semibold">{title}</h1>
          {detail ? (
            <p className="text-muted-foreground font-mono text-xs" translate="no">
              {detail.transferCode}
            </p>
          ) : null}
        </div>
      </header>

      {realtime.hasPendingChange || hasConflict ? (
        <TransferChangedBanner
          onReload={() => void reload()}
          onDismiss={() => {
            realtime.dismiss()
            setHasConflict(false)
          }}
        />
      ) : null}

      {unavailable ? (
        <OperationalEmptyState
          title="Bạn không có quyền tạo yêu cầu điều chuyển"
          description="Liên hệ chủ doanh nghiệp để được cấp quyền tạo điều chuyển."
        />
      ) : transferId && detailQuery.isLoading ? (
        <OperationalLoadingState rows={4} />
      ) : transferId && detailQuery.isError ? (
        <OperationalErrorState
          title="Không thể tải phiếu điều chuyển"
          onRetry={() => void detailQuery.refetch()}
        />
      ) : notEditable ? (
        <OperationalEmptyState
          title="Phiếu này không còn sửa được"
          description="Chỉ sửa được nháp hoặc phiếu đang thực hiện thuộc quy trình mới."
        />
      ) : (
        <TransferForm
          form={form}
          fields={fieldArray.fields}
          mode={mode}
          destinationOptions={destinationOptions}
          sourceOptions={sourceOptions}
          warehousesLocked={warehousesLocked}
          productOptions={productOptions}
          knownProductOptions={knownProductOptions}
          availabilityByProductId={availabilityByProductId}
          lockByItemId={lockInfoByItemId}
          isProductSearchLoading={productsQuery.isFetching}
          isSaving={isSaving}
          onDestinationChange={changeDestination}
          onSourceChange={(value) =>
            form.setValue('sourceWarehouseId', value, { shouldDirty: true, shouldValidate: true })
          }
          onProductSearchChange={(scope, value) =>
            setProductSearch((current) =>
              current?.scope === scope && current.value === value ? current : { scope, value }
            )
          }
          onAddLine={() => fieldArray.append({ ...EMPTY_TRANSFER_LINE })}
          onRemoveLine={fieldArray.remove}
          onSaveDraft={() => void form.handleSubmit(handleSaveDraft)()}
          onCancel={leave}
          onSubmit={() => void submit()}
        />
      )}

      <TransferConfirmDialog
        open={isConfirmOpen}
        title="Tạo yêu cầu điều chuyển?"
        description={
          <p>
            Hệ thống sẽ kiểm tồn khả dụng và giữ chỗ ngay <strong>{lines.length} dòng hàng</strong>{' '}
            (tổng {formatQuantity(totalBaseQuantity)} theo đơn vị chính) ở kho xuất. Nếu thiếu tồn,
            toàn bộ yêu cầu sẽ bị chặn và bản nháp được giữ lại.
          </p>
        }
        confirmLabel="Tạo yêu cầu"
        pendingLabel="Đang tạo…"
        isPending={isSaving}
        onOpenChange={setIsConfirmOpen}
        onConfirm={() => void form.handleSubmit(handleSubmitRequest)()}
      />
      <UnsavedChangesDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        onDiscard={() =>
          router.push(transferId ? APP_ROUTES.transferDetail(transferId) : APP_ROUTES.transfers)
        }
      />
    </div>
  )
}
