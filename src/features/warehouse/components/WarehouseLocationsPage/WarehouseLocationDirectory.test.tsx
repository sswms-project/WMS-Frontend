import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { ZoneResponse } from '@/types/warehouse'
import type { LocationFilterState, LocationSearchResponse } from '../../types/warehouse.types'
import { WarehouseLocationDirectory } from './WarehouseLocationDirectory'

const locations: LocationSearchResponse[] = [
  {
    id: 'zone-1',
    type: 'Zone',
    code: 'Z-01',
    name: 'Khu nhận hàng',
    lifecycleStatus: 'Active',
    occupancyStatus: null,
    zoneId: 'zone-1',
    zoneCode: 'Z-01',
    rackId: null,
    rackCode: null,
    capacity: null,
    currentOccupancy: null,
  },
  {
    id: 'slot-1',
    type: 'Slot',
    code: 'S-01',
    name: null,
    lifecycleStatus: 'Active',
    occupancyStatus: 'Occupied',
    zoneId: 'zone-1',
    zoneCode: 'Z-01',
    rackId: 'rack-1',
    rackCode: 'R-01',
    capacity: 100,
    currentOccupancy: 25,
  },
]

const zones: ZoneResponse[] = [
  {
    id: 'zone-1',
    zoneCode: 'Z-01',
    zoneName: 'Khu nhận hàng',
    description: null,
    status: 'Active',
    racks: [
      {
        id: 'rack-1',
        rackCode: 'R-01',
        rackName: 'Kệ 01',
        status: 'Active',
        slots: [],
      },
    ],
  },
]

const filters: LocationFilterState = {
  type: '',
  lifecycleStatus: '',
  occupancyStatus: '',
  zoneId: '',
  rackId: '',
}

interface DirectoryOverrides {
  readonly canGenerateBarcode?: boolean
  readonly zones?: readonly ZoneResponse[]
  readonly isLoading?: boolean
  readonly isError?: boolean
  readonly isFilterMetadataLoading?: boolean
  readonly isFilterMetadataError?: boolean
}

function renderDirectory(overrides?: DirectoryOverrides) {
  const callbacks = {
    onSearchTextChange: vi.fn(),
    onFiltersChange: vi.fn(),
    onApplyFilters: vi.fn(),
    onResetFilters: vi.fn(),
    onPageChange: vi.fn(),
    onRetry: vi.fn(),
    onRetryFilterMetadata: vi.fn(),
  }

  render(
    <TooltipProvider>
      <WarehouseLocationDirectory
        warehouseId="warehouse-1"
        locations={locations}
        zones={overrides?.zones ?? zones}
        totalCount={2}
        page={1}
        pageSize={20}
        searchText=""
        filters={filters}
        activeFilterCount={0}
        isLoading={overrides?.isLoading ?? false}
        isFetching={false}
        isError={overrides?.isError ?? false}
        isFilterMetadataLoading={overrides?.isFilterMetadataLoading ?? false}
        isFilterMetadataError={overrides?.isFilterMetadataError ?? false}
        canGenerateBarcode={overrides?.canGenerateBarcode ?? true}
        {...callbacks}
      />
    </TooltipProvider>
  )

  return callbacks
}

describe('WarehouseLocationDirectory', () => {
  it('renders hierarchy and typed barcode links for authorized users', () => {
    renderDirectory()

    expect(screen.getAllByText('S-01').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Z-01 / R-01').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Xem barcode S-01' })[0]).toHaveAttribute(
      'href',
      '/warehouses/warehouse-1/locations/slot/slot-1/barcode'
    )
  })

  it('does not expose barcode actions to warehouse staff', () => {
    renderDirectory({ canGenerateBarcode: false })
    expect(screen.queryByRole('link', { name: /Xem barcode/ })).not.toBeInTheDocument()
  })

  it('reports filter edits and applies the filter sheet', async () => {
    const user = userEvent.setup()
    const callbacks = renderDirectory()

    await user.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    await user.selectOptions(screen.getByLabelText('Loại vị trí'), 'Zone')
    await user.click(screen.getByRole('button', { name: 'Áp dụng bộ lọc' }))

    expect(callbacks.onFiltersChange).toHaveBeenCalledWith({
      ...filters,
      type: 'Zone',
      occupancyStatus: '',
    })
    expect(callbacks.onApplyFilters).toHaveBeenCalledOnce()
  })

  it('keeps location results available when filter metadata fails', async () => {
    const user = userEvent.setup()
    const callbacks = renderDirectory({ zones: [], isFilterMetadataError: true })

    expect(screen.getAllByText('S-01').length).toBeGreaterThan(0)
    expect(screen.queryByText('Không thể tải danh mục vị trí')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Bộ lọc' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Không thể tải cấu trúc kho')
    expect(screen.getByLabelText('Khu vực')).toBeDisabled()
    expect(screen.getByLabelText('Kệ hàng')).toBeDisabled()
    expect(screen.getByLabelText('Loại vị trí')).toBeEnabled()
    expect(screen.getByLabelText('Trạng thái hoạt động')).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Thử tải lại' }))
    expect(callbacks.onRetryFilterMetadata).toHaveBeenCalledOnce()
  })

  it('keeps cached parent filters enabled when metadata refresh fails', async () => {
    const user = userEvent.setup()
    renderDirectory({ isFilterMetadataError: true })

    await user.click(screen.getByRole('button', { name: 'Bộ lọc' }))

    expect(screen.getByLabelText('Khu vực')).toBeEnabled()
    expect(screen.getByLabelText('Kệ hàng')).toBeEnabled()
  })

  it('uses the full error state only for location request failures', () => {
    renderDirectory({ isError: true })

    expect(screen.getByText('Không thể tải danh mục vị trí')).toBeInTheDocument()
    expect(screen.queryByText('S-01')).not.toBeInTheDocument()
  })
})
