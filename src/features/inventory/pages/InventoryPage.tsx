'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { P } from '@/config/permissionCodes'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useProductOptionsQuery } from '@/features/inbound-request/hooks/use-inbound-requests'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { InventoryDirectory, ReportDamagedStockDialog } from '../components/InventoryPage'
import { useInventoryQuery, useReportDamagedStockMutation } from '../hooks/use-inventory'
import {
  reportDamagedStockSchema,
  type ReportDamagedStockFormValues,
} from '../schemas/report-damaged-stock.schema'
import type { InventoryStock } from '../types/inventory.types'
import { buildInventoryQuery } from '../utils/inventory-query'

export default function InventoryPage() {
  const [searchText, setSearchText] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [productId, setProductId] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [damagedStock, setDamagedStock] = useState<InventoryStock | null>(null)
  const meQuery = useMeQuery()
  const damagedMutation = useReportDamagedStockMutation()
  const damagedForm = useForm<ReportDamagedStockFormValues>({
    resolver: zodResolver(reportDamagedStockSchema),
    defaultValues: { quantity: 1, reason: '' },
  })
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const inventoryParams = useMemo(
    () =>
      buildInventoryQuery(
        { searchTerm: debouncedSearchText, warehouseId, productId },
        page,
        pageSize
      ),
    [debouncedSearchText, page, pageSize, productId, warehouseId]
  )
  const inventoryQuery = useInventoryQuery(inventoryParams)
  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })
  const productsQuery = useProductOptionsQuery({ pageNumber: 1, pageSize: 100, status: 'Active' })
  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data?.items ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
      })),
    [warehousesQuery.data?.items]
  )
  const productOptions = useMemo(
    () =>
      (productsQuery.data?.items ?? []).map((product) => ({
        value: product.id,
        label: `${product.sku} · ${product.productName}`,
      })),
    [productsQuery.data?.items]
  )

  function updateFilter(setValue: (value: string) => void, value: string) {
    setValue(value)
    setPage(1)
  }

  function handleDamagedDialogOpenChange(open: boolean) {
    if (!open) {
      setDamagedStock(null)
      damagedForm.reset({ quantity: 1, reason: '' })
    }
  }

  async function handleReportDamaged(values: ReportDamagedStockFormValues) {
    if (!damagedStock) return
    if (values.quantity > damagedStock.availableQuantity) {
      damagedForm.setError('quantity', {
        message: `Chỉ có ${damagedStock.availableQuantity} đơn vị chưa được giữ.`,
      })
      return
    }
    try {
      await damagedMutation.mutateAsync({
        productId: damagedStock.productId,
        warehouseId: damagedStock.warehouseId,
        slotId: damagedStock.slotId,
        ...(damagedStock.lotId ? { lotId: damagedStock.lotId } : {}),
        quantity: values.quantity,
        reason: values.reason.trim(),
      })
      toast.success('Đã ghi nhận hàng hỏng.')
      handleDamagedDialogOpenChange(false)
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Không thể ghi nhận hàng hỏng. Vui lòng thử lại.'
      toast.error(message)
    }
  }

  return (
    <>
      <InventoryDirectory
        permissions={meQuery.data?.permissions ?? []}
        items={inventoryQuery.data?.items ?? []}
        totalCount={inventoryQuery.data?.totalCount ?? 0}
        page={page}
        pageSize={pageSize}
        searchText={searchText}
        warehouseId={warehouseId}
        productId={productId}
        warehouseOptions={warehouseOptions}
        productOptions={productOptions}
        isLoading={inventoryQuery.isLoading}
        isFetching={inventoryQuery.isFetching}
        isError={inventoryQuery.isError}
        areFiltersLoading={warehousesQuery.isLoading || productsQuery.isLoading}
        areFiltersError={warehousesQuery.isError || productsQuery.isError}
        activeFilterCount={Number(Boolean(warehouseId)) + Number(Boolean(productId))}
        canReportDamaged={meQuery.data?.permissions.includes(P.INVENTORY_REPORT_DAMAGED) ?? false}
        onSearchChange={(value) => updateFilter(setSearchText, value)}
        onWarehouseChange={(value) => updateFilter(setWarehouseId, value)}
        onProductChange={(value) => updateFilter(setProductId, value)}
        onResetFilters={() => {
          setWarehouseId('')
          setProductId('')
          setPage(1)
        }}
        onRetryFilters={() => {
          void Promise.all([warehousesQuery.refetch(), productsQuery.refetch()])
        }}
        onPageChange={setPage}
        onPageSizeChange={(value) => {
          setPageSize(value)
          setPage(1)
        }}
        onRetry={() => void inventoryQuery.refetch()}
        onReportDamaged={setDamagedStock}
      />
      <ReportDamagedStockDialog
        item={damagedStock}
        form={damagedForm}
        isPending={damagedMutation.isPending}
        onOpenChange={handleDamagedDialogOpenChange}
        onSubmit={handleReportDamaged}
      />
    </>
  )
}
