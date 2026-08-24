'use client'

import { useMemo, useState } from 'react'
import { useProductOptionsQuery } from '@/features/purchase-order/hooks/use-purchase-orders'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { InventoryReservationDirectory } from '../components/InventoryReservationsPage'
import { useInventoryReservationsQuery } from '../hooks/use-inventory'
import { buildInventoryReservationQuery } from '../utils/inventory-reservation-query'

export default function InventoryReservationsPage() {
  const [warehouseId, setWarehouseId] = useState('')
  const [productId, setProductId] = useState('')
  const params = useMemo(
    () => buildInventoryReservationQuery(warehouseId, productId),
    [productId, warehouseId]
  )
  const reservationsQuery = useInventoryReservationsQuery(params)
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

  return (
    <InventoryReservationDirectory
      items={reservationsQuery.data ?? []}
      warehouseId={warehouseId}
      productId={productId}
      warehouseOptions={warehouseOptions}
      productOptions={productOptions}
      isLoading={reservationsQuery.isLoading}
      isFetching={reservationsQuery.isFetching}
      isError={reservationsQuery.isError}
      areFiltersLoading={warehousesQuery.isLoading || productsQuery.isLoading}
      areFiltersError={warehousesQuery.isError || productsQuery.isError}
      activeFilterCount={Number(Boolean(warehouseId)) + Number(Boolean(productId))}
      onWarehouseChange={setWarehouseId}
      onProductChange={setProductId}
      onResetFilters={() => {
        setWarehouseId('')
        setProductId('')
      }}
      onRetryFilters={() => void Promise.all([warehousesQuery.refetch(), productsQuery.refetch()])}
      onRetry={() => void reservationsQuery.refetch()}
    />
  )
}
