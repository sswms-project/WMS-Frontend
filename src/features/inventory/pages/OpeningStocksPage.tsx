'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useProductOptionsQuery } from '@/features/inbound-request/hooks/use-inbound-requests'
import { useProductLotsQuery } from '@/features/product/hooks/use-products'
import {
  useWarehouseLocationsQuery,
  useWarehousesQuery,
} from '@/features/warehouse/hooks/use-warehouse'
import { OpeningStockDirectory, type OpeningStockDraftLine } from '../components/OpeningStocksPage'
import {
  useCreateOpeningStockMutation,
  useOpeningStockActionMutation,
  useOpeningStocksQuery,
  useUpdateOpeningStockMutation,
  useUploadInventoryEvidenceMutation,
} from '../hooks/use-inventory'
import {
  createOpeningStockSchema,
  type CreateOpeningStockFormValues,
} from '../schemas/create-opening-stock.schema'
import type { OpeningStockRecord, OpeningStockStatus } from '../types/inventory.types'

export default function OpeningStocksPage() {
  const meQuery = useMeQuery()
  const [page, setPage] = useState(1)
  const [filterWarehouseId, setFilterWarehouseId] = useState('')
  const [status, setStatus] = useState<OpeningStockStatus | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const recordsQuery = useOpeningStocksQuery({
    pageNumber: page,
    pageSize: 20,
    ...(filterWarehouseId ? { warehouseId: filterWarehouseId } : {}),
    ...(status ? { status } : {}),
    ...(dateFrom ? { dateFrom: new Date(`${dateFrom}T00:00:00`).toISOString() } : {}),
    ...(dateTo ? { dateTo: new Date(`${dateTo}T23:59:59.999`).toISOString() } : {}),
  })
  const createMutation = useCreateOpeningStockMutation()
  const uploadMutation = useUploadInventoryEvidenceMutation()
  const actionMutation = useOpeningStockActionMutation()
  const updateMutation = useUpdateOpeningStockMutation()
  const form = useForm<CreateOpeningStockFormValues>({
    resolver: zodResolver(createOpeningStockSchema),
    defaultValues: {
      warehouseId: '',
      productId: '',
      slotId: '',
      lotId: '',
      quantity: 1,
      qualityStatus: 'Good',
      eligibilityStatus: 'Available',
    },
  })
  const warehouseId = useWatch({ control: form.control, name: 'warehouseId' })
  const productId = useWatch({ control: form.control, name: 'productId' })
  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })
  const productsQuery = useProductOptionsQuery({ pageNumber: 1, pageSize: 100, status: 'Active' })
  const slotsQuery = useWarehouseLocationsQuery(warehouseId, {
    top: 200,
    skip: 0,
    needTotalCount: true,
    type: 'Slot',
    lifecycleStatus: 'Active',
  })
  const lotsQuery = useProductLotsQuery(
    productId,
    { warehouseId, status: 'Active' },
    Boolean(productId && warehouseId)
  )
  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data?.items ?? []).map((item) => ({
        value: item.id,
        label: `${item.warehouseCode} · ${item.warehouseName}`,
      })),
    [warehousesQuery.data?.items]
  )
  const productOptions = useMemo(
    () =>
      (productsQuery.data?.items ?? []).map((item) => ({
        value: item.id,
        label: `${item.sku} · ${item.productName}`,
        unitId: item.unitId,
        unitName: item.unitName,
      })),
    [productsQuery.data?.items]
  )
  const slotOptions = useMemo(
    () => (slotsQuery.data?.items ?? []).map((item) => ({ value: item.id, label: item.code })),
    [slotsQuery.data?.items]
  )
  const lotOptions = useMemo(
    () => (lotsQuery.data ?? []).map((item) => ({ value: item.id, label: item.lotNumber })),
    [lotsQuery.data]
  )

  async function create(values: CreateOpeningStockFormValues, lines: OpeningStockDraftLine[]) {
    try {
      if (!values.evidenceFile) {
        form.setError('evidenceFile', { message: 'Tệp bằng chứng là bắt buộc.' })
        return
      }
      const upload = await uploadMutation.mutateAsync({
        warehouseId: values.warehouseId,
        file: values.evidenceFile,
      })
      await createMutation.mutateAsync({
        warehouseId: values.warehouseId,
        evidenceIds: [upload.data.id],
        commandId: crypto.randomUUID(),
        lines: lines.map((line) => ({
          productId: line.productId,
          slotId: line.slotId,
          ...(line.lotId ? { lotId: line.lotId } : {}),
          quantity: line.quantity,
          enteredUnitId: line.enteredUnitId,
          conversionFactor: 1,
          qualityStatus: line.qualityStatus,
          eligibilityStatus: line.eligibilityStatus,
        })),
      })
      form.reset()
      toast.success('Đã tạo chứng từ tồn đầu ở trạng thái nháp.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo chứng từ tồn đầu.')
      throw error
    }
  }

  async function update(item: OpeningStockRecord, lines: OpeningStockDraftLine[]) {
    if (!item.version) {
      toast.error('Chứng từ chưa có phiên bản. Vui lòng tải lại.')
      return
    }
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        expectedVersion: item.version,
        lines: lines.map((line) => ({
          productId: line.productId,
          slotId: line.slotId,
          ...(line.lotId ? { lotId: line.lotId } : {}),
          quantity: line.quantity,
          enteredUnitId: line.enteredUnitId,
          conversionFactor: line.conversionFactor,
          qualityStatus: line.qualityStatus,
          eligibilityStatus: line.eligibilityStatus,
        })),
      })
      toast.success('Đã cập nhật các dòng kiểm đếm. Bạn có thể gửi lại để duyệt.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật chứng từ tồn đầu.')
      throw error
    }
  }

  async function action(
    item: OpeningStockRecord,
    actionName: 'submit' | 'approve' | 'review' | 'cancel' | 'withdraw',
    decision?: 'Returned' | 'Rejected' | 'Cancelled',
    reason?: string
  ) {
    if (!item.version) {
      toast.error('Chứng từ chưa có phiên bản. Vui lòng tải lại.')
      return
    }
    try {
      if (actionName === 'review' && decision)
        await actionMutation.mutateAsync({
          action: 'review',
          id: item.id,
          expectedVersion: item.version,
          decision,
          reason: reason ?? '',
        })
      else if (actionName === 'cancel')
        await actionMutation.mutateAsync({
          action: 'cancel',
          id: item.id,
          expectedVersion: item.version,
          reason: reason ?? '',
        })
      else if (actionName === 'withdraw')
        await actionMutation.mutateAsync({
          action: 'withdraw',
          id: item.id,
          expectedVersion: item.version,
          reason: reason ?? '',
        })
      else if (actionName !== 'review')
        await actionMutation.mutateAsync({
          action: actionName,
          id: item.id,
          expectedVersion: item.version,
        })
      toast.success(
        actionName === 'approve' ? 'Đã duyệt và ghi sổ tồn đầu.' : 'Đã cập nhật chứng từ tồn đầu.'
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật chứng từ tồn đầu.')
      throw error
    }
  }

  const permissions = meQuery.data?.permissions ?? []
  return (
    <OpeningStockDirectory
      permissions={permissions}
      currentUserId={meQuery.data?.id ?? null}
      items={recordsQuery.data?.items ?? []}
      form={form}
      warehouseOptions={warehouseOptions}
      page={recordsQuery.data?.pageNumber ?? page}
      pageSize={recordsQuery.data?.pageSize ?? 20}
      totalCount={recordsQuery.data?.totalCount ?? 0}
      filterWarehouseId={filterWarehouseId}
      statusFilter={status}
      dateFrom={dateFrom}
      dateTo={dateTo}
      onDateFromChange={(value) => {
        setDateFrom(value)
        setPage(1)
      }}
      onDateToChange={(value) => {
        setDateTo(value)
        setPage(1)
      }}
      onPageChange={setPage}
      onFilterWarehouseChange={(value) => {
        setFilterWarehouseId(value)
        setPage(1)
      }}
      onStatusFilterChange={(value) => {
        setStatus(value)
        setPage(1)
      }}
      productOptions={productOptions}
      slotOptions={slotOptions}
      lotOptions={lotOptions}
      areOptionsLoading={
        warehousesQuery.isLoading ||
        productsQuery.isLoading ||
        slotsQuery.isLoading ||
        lotsQuery.isLoading
      }
      isLoading={recordsQuery.isLoading}
      isError={recordsQuery.isError}
      isPending={
        uploadMutation.isPending ||
        createMutation.isPending ||
        updateMutation.isPending ||
        actionMutation.isPending
      }
      canCreate={permissions.includes(P.INVENTORY_RESERVE)}
      canApprove={permissions.includes(P.STOCK_ADJUSTMENTS_APPROVE)}
      onRetry={() => void recordsQuery.refetch()}
      onCreate={create}
      onUpdate={update}
      onAction={action}
    />
  )
}
