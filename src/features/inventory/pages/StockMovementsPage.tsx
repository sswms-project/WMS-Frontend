'use client'

import { useMemo, useState } from 'react'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useProductOptionsQuery } from '@/features/inbound-request/hooks/use-inbound-requests'
import { StockMovementHistory } from '../components/StockMovementsPage'
import { useStockMovementsQuery } from '../hooks/use-inventory'
import type { StockMovementType } from '../types/inventory.types'
import {
  buildStockMovementQuery,
  isStockMovementDateRangeValid,
} from '../utils/stock-movement-query'

export default function StockMovementsPage() {
  const meQuery = useMeQuery()
  const [productId, setProductId] = useState('')
  const [movementType, setMovementType] = useState<StockMovementType | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const isDateRangeValid = isStockMovementDateRangeValid(dateFrom, dateTo)
  const movementParams = useMemo(
    () => buildStockMovementQuery({ productId, movementType, dateFrom, dateTo }, page, pageSize),
    [dateFrom, dateTo, movementType, page, pageSize, productId]
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
      permissions={meQuery.data?.permissions ?? []}
      items={movementsQuery.data?.items ?? []}
      totalCount={movementsQuery.data?.totalCount ?? 0}
      page={page}
      pageSize={pageSize}
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
      onPageSizeChange={(value) => {
        setPageSize(value)
        setPage(1)
      }}
      onRetry={() => void movementsQuery.refetch()}
    />
  )
}
