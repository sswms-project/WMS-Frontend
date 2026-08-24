'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useProductOptionsQuery } from '@/features/purchase-order/hooks/use-purchase-orders'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { InventoryDirectory, ReserveStockDialog } from '../components/InventoryPage'
import { useInventoryQuery, useReserveStockMutation } from '../hooks/use-inventory'
import { reserveStockSchema, type ReserveStockFormValues } from '../schemas/reserve-stock.schema'
import type { InventoryBalance } from '../types/inventory.types'
import { buildInventoryQuery } from '../utils/inventory-query'

const PAGE_SIZE = 20

export default function InventoryPage() {
  const [searchText, setSearchText] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [productId, setProductId] = useState('')
  const [page, setPage] = useState(1)
  const [selectedBalance, setSelectedBalance] = useState<InventoryBalance | null>(null)
  const meQuery = useMeQuery()
  const reserveMutation = useReserveStockMutation()
  const reserveForm = useForm<ReserveStockFormValues>({
    resolver: zodResolver(reserveStockSchema),
    defaultValues: { quantity: 1 },
  })
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const inventoryParams = useMemo(
    () =>
      buildInventoryQuery(
        { searchTerm: debouncedSearchText, warehouseId, productId },
        page,
        PAGE_SIZE
      ),
    [debouncedSearchText, page, productId, warehouseId]
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

  function handleReserveDialogOpenChange(open: boolean) {
    if (!open) {
      setSelectedBalance(null)
      reserveForm.reset({ quantity: 1 })
    }
  }

  async function handleReserve(values: ReserveStockFormValues) {
    if (!selectedBalance) return
    if (values.quantity > selectedBalance.availableQuantity) {
      reserveForm.setError('quantity', {
        message: `Chỉ còn ${selectedBalance.availableQuantity} đơn vị khả dụng.`,
      })
      return
    }
    try {
      await reserveMutation.mutateAsync({
        productId: selectedBalance.productId,
        warehouseId: selectedBalance.warehouseId,
        slotId: selectedBalance.slotId,
        quantity: values.quantity,
      })
      toast.success('Đã giữ tồn kho thành công.')
      handleReserveDialogOpenChange(false)
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Không thể giữ tồn kho. Vui lòng thử lại.'
      toast.error(message)
    }
  }

  return (
    <>
      <InventoryDirectory
        items={inventoryQuery.data?.items ?? []}
        totalCount={inventoryQuery.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
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
        canReserve={meQuery.data?.permissions.includes('inventory:reserve') ?? false}
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
        onRetry={() => void inventoryQuery.refetch()}
        onReserve={setSelectedBalance}
      />
      <ReserveStockDialog
        item={selectedBalance}
        form={reserveForm}
        isPending={reserveMutation.isPending}
        onOpenChange={handleReserveDialogOpenChange}
        onSubmit={handleReserve}
      />
    </>
  )
}
