'use client'

import { useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useProductOptionsQuery } from '@/features/purchase-order/hooks/use-purchase-orders'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { InventoryDirectory } from '../components/InventoryPage'
import { useInventoryQuery } from '../hooks/use-inventory'
import { buildInventoryQuery } from '../utils/inventory-query'

const PAGE_SIZE = 20

export default function InventoryPage() {
  const [searchText, setSearchText] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [productId, setProductId] = useState('')
  const [page, setPage] = useState(1)
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

  return (
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
    />
  )
}
