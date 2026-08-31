'use client'

import { useMemo, useState } from 'react'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useProductListQuery } from '@/features/product/hooks/use-products'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { InventoryForecastDirectory } from '../components/InventoryForecastPage'
import { useInventoryForecastQuery, useInventoryStockHistoryQuery } from '../hooks/use-inventory'
import { mergeHistoryAndForecast } from '../utils/forecast-chart'

const DEFAULT_HORIZON_DAYS = 14

export default function InventoryForecastPage() {
  const meQuery = useMeQuery()
  const [productId, setProductId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [horizonDays, setHorizonDays] = useState(DEFAULT_HORIZON_DAYS)

  const hasProduct = Boolean(productId)

  const forecastParams = useMemo(
    () => ({ productId, warehouseId: warehouseId || undefined, horizonDays }),
    [productId, warehouseId, horizonDays]
  )
  const historyParams = useMemo(
    () => ({ productId, warehouseId: warehouseId || undefined }),
    [productId, warehouseId]
  )

  const forecastQuery = useInventoryForecastQuery(forecastParams, hasProduct)
  const historyQuery = useInventoryStockHistoryQuery(historyParams, hasProduct)

  const productsQuery = useProductListQuery({ pageSize: 200 })
  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })

  const productOptions = useMemo(
    () =>
      (productsQuery.data?.items ?? []).map((product) => ({
        value: product.id,
        label: `${product.sku} · ${product.productName}`,
      })),
    [productsQuery.data?.items]
  )
  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data?.items ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
      })),
    [warehousesQuery.data?.items]
  )

  const chartData = useMemo(
    () =>
      mergeHistoryAndForecast(historyQuery.data?.history ?? [], forecastQuery.data?.forecast ?? []),
    [historyQuery.data?.history, forecastQuery.data?.forecast]
  )

  const isLoading = hasProduct && (forecastQuery.isLoading || historyQuery.isLoading)
  const isFetching = forecastQuery.isFetching || historyQuery.isFetching
  const isError = forecastQuery.isError || historyQuery.isError

  return (
    <InventoryForecastDirectory
      permissions={meQuery.data?.permissions ?? []}
      productId={productId}
      productOptions={productOptions}
      warehouseId={warehouseId}
      warehouseOptions={warehouseOptions}
      horizonDays={horizonDays}
      chartData={chartData}
      modelName={forecastQuery.data?.modelName}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      areProductsLoading={productsQuery.isLoading}
      areWarehousesLoading={warehousesQuery.isLoading}
      onProductChange={setProductId}
      onWarehouseChange={setWarehouseId}
      onHorizonChange={setHorizonDays}
      onRetry={() => {
        void forecastQuery.refetch()
        void historyQuery.refetch()
      }}
    />
  )
}
