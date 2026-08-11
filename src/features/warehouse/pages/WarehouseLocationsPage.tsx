'use client'

import { useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useAuthStore } from '@/stores/auth.store'
import { WarehouseLocationDirectory } from '../components/WarehouseLocationsPage'
import { useWarehouseLayoutQuery, useWarehouseLocationsQuery } from '../hooks/use-warehouse'
import type { LocationFilterState, WarehouseLocationQuery } from '../types/warehouse.types'
import { getWarehouseCapabilities } from '../utils/warehouse-capabilities'

interface WarehouseLocationsPageProps {
  readonly warehouseId: string
}

const PAGE_SIZE = 20
const EMPTY_FILTERS: LocationFilterState = {
  type: '',
  lifecycleStatus: '',
  occupancyStatus: '',
  zoneId: '',
  rackId: '',
}

export function WarehouseLocationsPage({ warehouseId }: WarehouseLocationsPageProps) {
  const role = useAuthStore((state) => state.user?.role ?? null)
  const capabilities = getWarehouseCapabilities(role)
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<LocationFilterState>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<LocationFilterState>(EMPTY_FILTERS)
  const debouncedSearchText = useDebouncedValue(searchText.trim(), 350)
  const query = useMemo<WarehouseLocationQuery>(
    () => ({
      top: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      needTotalCount: true,
      ...(debouncedSearchText ? { searchText: debouncedSearchText } : {}),
      ...(appliedFilters.type ? { type: appliedFilters.type } : {}),
      ...(appliedFilters.lifecycleStatus
        ? { lifecycleStatus: appliedFilters.lifecycleStatus }
        : {}),
      ...(appliedFilters.occupancyStatus
        ? { occupancyStatus: appliedFilters.occupancyStatus }
        : {}),
      ...(appliedFilters.zoneId ? { zoneId: appliedFilters.zoneId } : {}),
      ...(appliedFilters.rackId ? { rackId: appliedFilters.rackId } : {}),
    }),
    [appliedFilters, debouncedSearchText, page]
  )
  const locationsQuery = useWarehouseLocationsQuery(warehouseId, query)
  const layoutQuery = useWarehouseLayoutQuery(warehouseId, true)
  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length

  function resetFilters() {
    setFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setPage(1)
  }

  return (
    <WarehouseLocationDirectory
      warehouseId={warehouseId}
      locations={locationsQuery.data?.items ?? []}
      zones={layoutQuery.data ?? []}
      totalCount={locationsQuery.data?.totalCount ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      searchText={searchText}
      filters={filters}
      activeFilterCount={activeFilterCount}
      isLoading={locationsQuery.isLoading}
      isError={locationsQuery.isError}
      isFilterMetadataLoading={layoutQuery.isLoading}
      isFilterMetadataError={layoutQuery.isError}
      canGenerateBarcode={capabilities.canGenerateLocationBarcode}
      onSearchTextChange={(value) => {
        setSearchText(value)
        setPage(1)
      }}
      onFiltersChange={setFilters}
      onApplyFilters={() => {
        setAppliedFilters(filters)
        setPage(1)
      }}
      onResetFilters={resetFilters}
      onPageChange={setPage}
      onRetry={() => void Promise.all([locationsQuery.refetch(), layoutQuery.refetch()])}
      onRetryFilterMetadata={() => void layoutQuery.refetch()}
    />
  )
}
