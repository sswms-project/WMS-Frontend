import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { USER_ROLES } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import type { ZoneResponse } from '@/types/warehouse'
import { WarehouseLayoutPage } from './WarehouseLayoutPage'

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  searchParams: new URLSearchParams('zone=zone-1&rack=rack-1'),
}))

const warehouseHooks = vi.hoisted(() => ({
  warehouseQuery: {
    data: { status: 'Active' },
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
  mutation: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => navigation.searchParams,
}))

vi.mock('../hooks/use-warehouse', () => ({
  useWarehouseQuery: () => warehouseHooks.warehouseQuery,
  useWarehouseLayoutQuery: () => warehouseHooks.layoutQuery,
  useCreateZoneMutation: () => warehouseHooks.mutation,
  useUpdateZoneMutation: () => warehouseHooks.mutation,
  useDeactivateZoneMutation: () => warehouseHooks.mutation,
  useCreateRackMutation: () => warehouseHooks.mutation,
  useUpdateRackMutation: () => warehouseHooks.mutation,
  useDeactivateRackMutation: () => warehouseHooks.mutation,
  useCreateSlotMutation: () => warehouseHooks.mutation,
  useUpdateSlotMutation: () => warehouseHooks.mutation,
  useDeactivateSlotMutation: () => warehouseHooks.mutation,
}))

const zones: ZoneResponse[] = [
  {
    id: 'zone-1',
    zoneCode: 'A',
    zoneName: 'Khu A',
    description: null,
    status: 'Active',
    racks: [
      {
        id: 'rack-1',
        rackCode: 'A-01',
        rackName: 'Kệ A-01',
        status: 'Active',
        slots: [],
      },
    ],
  },
  {
    id: 'zone-2',
    zoneCode: 'B',
    zoneName: 'Khu B',
    description: null,
    status: 'Active',
    racks: [],
  },
]

describe('WarehouseLayoutPage', () => {
  beforeEach(() => {
    navigation.push.mockReset()
    warehouseHooks.layoutQuery.refetch.mockReset()
    warehouseHooks.warehouseQuery.refetch.mockReset()
    warehouseHooks.layoutQuery.data = zones
    warehouseHooks.layoutQuery.isLoading = false
    warehouseHooks.layoutQuery.isError = false
    warehouseHooks.warehouseQuery.isLoading = false
    warehouseHooks.warehouseQuery.isError = false
    warehouseHooks.mutation.mutateAsync.mockReset()
    warehouseHooks.mutation.mutateAsync.mockResolvedValue({ data: 'created-id' })
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
        <WarehouseLayoutPage warehouseId="warehouse-1" />
      </TooltipProvider>
    )
  }

  it('writes explorer selections back to the route', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /Khu B/ }))
    await user.click(screen.getByRole('button', { name: 'Quay lại danh sách kệ' }))

    expect(navigation.push).toHaveBeenNthCalledWith(
      1,
      '/warehouses/warehouse-1/layout?zone=zone-2',
      { scroll: false }
    )
    expect(navigation.push).toHaveBeenNthCalledWith(
      2,
      '/warehouses/warehouse-1/layout?zone=zone-1',
      { scroll: false }
    )
  })

  it('offers retry when the layout request fails', async () => {
    const user = userEvent.setup()
    warehouseHooks.layoutQuery.data = undefined
    warehouseHooks.layoutQuery.isError = true

    renderPage()
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(screen.getByText('Không thể tải bố cục kho')).toBeInTheDocument()
    expect(warehouseHooks.layoutQuery.refetch).toHaveBeenCalledOnce()
  })

  it('submits a validated zone create payload from the contextual sheet', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Thêm khu vực' }))
    await user.type(screen.getByLabelText('Mã khu vực'), 'Z-01')
    await user.type(screen.getByLabelText('Tên khu vực'), 'Khu nhận hàng')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(warehouseHooks.mutation.mutateAsync).toHaveBeenCalledWith({
      warehouseId: 'warehouse-1',
      request: {
        zoneCode: 'Z-01',
        zoneName: 'Khu nhận hàng',
        description: '',
      },
    })
  })
})
