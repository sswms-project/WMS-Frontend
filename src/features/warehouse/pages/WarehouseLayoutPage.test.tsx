import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ZoneResponse } from '@/types/warehouse'
import { WarehouseLayoutPage } from './WarehouseLayoutPage'

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  searchParams: new URLSearchParams('zone=zone-1&rack=rack-1'),
}))

const warehouseHooks = vi.hoisted(() => ({
  layoutQuery: {
    data: undefined as ZoneResponse[] | undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => navigation.searchParams,
}))

vi.mock('../hooks/use-warehouse', () => ({
  useWarehouseLayoutQuery: () => warehouseHooks.layoutQuery,
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
    warehouseHooks.layoutQuery.data = zones
    warehouseHooks.layoutQuery.isLoading = false
    warehouseHooks.layoutQuery.isError = false
  })

  it('writes explorer selections back to the route', async () => {
    const user = userEvent.setup()
    render(<WarehouseLayoutPage warehouseId="warehouse-1" />)

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

    render(<WarehouseLayoutPage warehouseId="warehouse-1" />)
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(screen.getByText('Không thể tải bố cục kho')).toBeInTheDocument()
    expect(warehouseHooks.layoutQuery.refetch).toHaveBeenCalledOnce()
  })
})
