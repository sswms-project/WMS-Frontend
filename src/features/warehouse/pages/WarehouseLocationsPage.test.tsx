import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { USER_ROLES } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import type { ZoneResponse } from '@/types/warehouse'
import type { LocationSearchResponse } from '../types/warehouse.types'
import { WarehouseLocationsPage } from './WarehouseLocationsPage'

const warehouseHooks = vi.hoisted(() => ({
  useWarehouseLocationsQuery: vi.fn(),
  locationsQuery: {
    data: undefined as { items: LocationSearchResponse[]; totalCount: number } | undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  layoutQuery: {
    data: undefined as ZoneResponse[] | undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}))

vi.mock('../hooks/use-warehouse', () => ({
  useWarehouseLocationsQuery: warehouseHooks.useWarehouseLocationsQuery,
  useWarehouseLayoutQuery: () => warehouseHooks.layoutQuery,
}))

const slot: LocationSearchResponse = {
  id: 'slot-1',
  type: 'Slot',
  code: 'S-01',
  name: null,
  lifecycleStatus: 'Active',
  occupancyStatus: 'Vacant',
  zoneId: 'zone-1',
  zoneCode: 'Z-01',
  rackId: 'rack-1',
  rackCode: 'R-01',
  capacity: 10,
  currentOccupancy: 0,
  barcodeValue: 'S-01',
}

describe('WarehouseLocationsPage', () => {
  beforeEach(() => {
    warehouseHooks.locationsQuery.data = { items: [slot], totalCount: 1 }
    warehouseHooks.locationsQuery.isLoading = false
    warehouseHooks.locationsQuery.isFetching = false
    warehouseHooks.locationsQuery.isError = false
    warehouseHooks.locationsQuery.refetch.mockReset()
    warehouseHooks.useWarehouseLocationsQuery.mockReset()
    warehouseHooks.useWarehouseLocationsQuery.mockImplementation(
      () => warehouseHooks.locationsQuery
    )
    warehouseHooks.layoutQuery.data = undefined
    warehouseHooks.layoutQuery.isLoading = false
    warehouseHooks.layoutQuery.isError = false
    warehouseHooks.layoutQuery.refetch.mockReset()
    useAuthStore.setState({
      user: {
        id: 'owner-1',
        tenantId: 'tenant-1',
        fullName: 'Tenant Owner',
        email: 'tenant.owner@sswms.local',
        role: USER_ROLES.TenantOwner,
        isActive: true,
      },
    })
  })

  function renderPage() {
    return render(
      <TooltipProvider>
        <WarehouseLocationsPage warehouseId="warehouse-1" />
      </TooltipProvider>
    )
  }

  it('renders location data when only layout metadata fails', async () => {
    const user = userEvent.setup()
    warehouseHooks.layoutQuery.isError = true

    renderPage()

    expect(screen.getAllByText('S-01').length).toBeGreaterThan(0)
    expect(screen.queryByText('Không thể tải danh mục vị trí')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    await user.click(screen.getByRole('button', { name: 'Thử tải lại' }))

    expect(warehouseHooks.layoutQuery.refetch).toHaveBeenCalledOnce()
    expect(warehouseHooks.locationsQuery.refetch).not.toHaveBeenCalled()
  })

  it('renders the full error state when the location request fails', () => {
    warehouseHooks.locationsQuery.data = undefined
    warehouseHooks.locationsQuery.isError = true

    renderPage()

    expect(screen.getByText('Không thể tải danh mục vị trí')).toBeInTheDocument()
    expect(screen.queryByText('S-01')).not.toBeInTheDocument()
  })

  it('requests ten locations per page and advances with server-side offsets', async () => {
    const user = userEvent.setup()
    warehouseHooks.locationsQuery.data = { items: [slot], totalCount: 15 }

    renderPage()

    expect(warehouseHooks.useWarehouseLocationsQuery).toHaveBeenLastCalledWith(
      'warehouse-1',
      expect.objectContaining({ top: 10, skip: 0, needTotalCount: true })
    )

    await user.click(screen.getByRole('link', { name: 'Go to next page' }))

    expect(warehouseHooks.useWarehouseLocationsQuery).toHaveBeenLastCalledWith(
      'warehouse-1',
      expect.objectContaining({ top: 10, skip: 10, needTotalCount: true })
    )
  })

  it('returns to the first page when search text changes', async () => {
    const user = userEvent.setup()
    warehouseHooks.locationsQuery.data = { items: [slot], totalCount: 15 }

    renderPage()
    await user.click(screen.getByRole('link', { name: 'Go to next page' }))
    await user.type(screen.getByRole('textbox', { name: 'Tìm theo mã hoặc tên vị trí' }), 'S-01')

    expect(warehouseHooks.useWarehouseLocationsQuery).toHaveBeenLastCalledWith(
      'warehouse-1',
      expect.objectContaining({ top: 10, skip: 0, needTotalCount: true })
    )
  })

  it('returns to the first page when filters are applied or reset', async () => {
    const user = userEvent.setup()
    warehouseHooks.locationsQuery.data = { items: [slot], totalCount: 15 }

    renderPage()
    await user.click(screen.getByRole('link', { name: 'Go to next page' }))
    await user.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    await user.selectOptions(screen.getByLabelText('Loại vị trí'), 'Slot')
    await user.click(screen.getByRole('button', { name: 'Áp dụng bộ lọc' }))

    expect(warehouseHooks.useWarehouseLocationsQuery).toHaveBeenLastCalledWith(
      'warehouse-1',
      expect.objectContaining({ top: 10, skip: 0, type: 'Slot' })
    )

    await user.click(screen.getByRole('button', { name: 'Bộ lọc (1)' }))
    await user.click(screen.getByRole('button', { name: 'Đặt lại' }))

    expect(warehouseHooks.useWarehouseLocationsQuery).toHaveBeenLastCalledWith(
      'warehouse-1',
      expect.not.objectContaining({ type: 'Slot' })
    )
  })
})
