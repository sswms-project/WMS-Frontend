'use client'

import { useMemo, useState } from 'react'
import { useProductOptionsQuery } from '@/features/purchase-order/hooks/use-purchase-orders'
import { StockMovementHistory } from '../components/StockMovementsPage'
import { useStockMovementsQuery } from '../hooks/use-inventory'
import type { StockMovementType } from '../types/inventory.types'
import {
  buildStockMovementQuery,
  isStockMovementDateRangeValid,
} from '../utils/stock-movement-query'

const PAGE_SIZE = 20

export default function StockMovementsPage() {
  const [productId, setProductId] = useState('')
  const [movementType, setMovementType] = useState<StockMovementType | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const isDateRangeValid = isStockMovementDateRangeValid(dateFrom, dateTo)
  const movementParams = useMemo(
    () => buildStockMovementQuery({ productId, movementType, dateFrom, dateTo }, page, PAGE_SIZE),
    [dateFrom, dateTo, movementType, page, productId]
  )
  const movementsQuery = useStockMovementsQuery(movementParams, isDateRangeValid)
  const productsQuery = useProductOptionsQuery({ pageNumber: 1, pageSize: 100, status: 'Active' })
  const productOptions = useMemo(
    () =>
      (productsQuery.data?.items ?? []).map((product) => ({
        value: product.id,
        label: `${product.sku} · ${product.productName}`,
      })),
    [productsQuery.data?.items]
  )

  function updateFilter<T>(setValue: (value: T) => void, value: T) {
    setValue(value)
    setPage(1)
  }

  return (
    <StockMovementHistory
      items={movementsQuery.data?.items ?? []}
      totalCount={movementsQuery.data?.totalCount ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      productId={productId}
      movementType={movementType}
      dateFrom={dateFrom}
      dateTo={dateTo}
      productOptions={productOptions}
      isLoading={movementsQuery.isLoading && isDateRangeValid}
      isFetching={movementsQuery.isFetching}
      isError={movementsQuery.isError}
      isDateRangeValid={isDateRangeValid}
      areProductsLoading={productsQuery.isLoading}
      areProductsError={productsQuery.isError}
      activeFilterCount={
        Number(Boolean(productId)) +
        Number(Boolean(movementType)) +
        Number(Boolean(dateFrom)) +
        Number(Boolean(dateTo))
      }
      onProductChange={(value) => updateFilter(setProductId, value)}
      onMovementTypeChange={(value) => updateFilter(setMovementType, value)}
      onDateFromChange={(value) => updateFilter(setDateFrom, value)}
      onDateToChange={(value) => updateFilter(setDateTo, value)}
      onResetFilters={() => {
        setProductId('')
        setMovementType('')
        setDateFrom('')
        setDateTo('')
        setPage(1)
      }}
      onRetryProducts={() => void productsQuery.refetch()}
      onPageChange={setPage}
      onRetry={() => void movementsQuery.refetch()}
    />
  )
}
