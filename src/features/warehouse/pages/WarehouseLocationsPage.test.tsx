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
  locationsQuery: {
    data: undefined as { items: LocationSearchResponse[]; totalCount: number } | undefined,
    isLoading: false,
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
  useWarehouseLocationsQuery: () => warehouseHooks.locationsQuery,
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
}

describe('WarehouseLocationsPage', () => {
  beforeEach(() => {
    warehouseHooks.locationsQuery.data = { items: [slot], totalCount: 1 }
    warehouseHooks.locationsQuery.isLoading = false
    warehouseHooks.locationsQuery.isError = false
    warehouseHooks.locationsQuery.refetch.mockReset()
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
})
