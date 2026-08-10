import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { USER_ROLES, type UserRole } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import type { WarehouseDetailResponse } from '@/types/warehouse'
import { WarehouseWorkspaceLayout } from './WarehouseWorkspaceLayout'

const warehouse: WarehouseDetailResponse = {
  id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
  warehouseCode: 'HCM-01',
  warehouseName: 'Kho Thủ Đức',
  address: 'Thủ Đức, Hồ Chí Minh',
  status: 'Active',
  zoneCount: 2,
  createdAt: '2026-08-09T00:00:00.000Z',
  modifiedAt: '2026-08-09T01:00:00.000Z',
}

let currentPathname = `/warehouses/${warehouse.id}`
let warehouseData = warehouse

const updateMutation = {
  isPending: false,
  mutateAsync: vi.fn(),
}

vi.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
}))

vi.mock('../../hooks/use-warehouse', () => ({
  useWarehouseQuery: () => ({
    data: warehouseData,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useUpdateWarehouseMutation: () => updateMutation,
}))

function setRole(role: UserRole) {
  useAuthStore.setState({
    user: {
      id: 'user-1',
      tenantId: 'tenant-1',
      fullName: 'Warehouse User',
      email: 'warehouse.user@sswms.local',
      role,
      isActive: true,
    },
  })
}

describe('WarehouseWorkspaceLayout', () => {
  beforeEach(() => {
    currentPathname = `/warehouses/${warehouse.id}`
    warehouseData = warehouse
    updateMutation.mutateAsync.mockReset()
    setRole(USER_ROLES.TenantOwner)
  })

  it('renders route-backed workspace navigation and owner edit action', () => {
    render(
      <WarehouseWorkspaceLayout warehouseId={warehouse.id}>
        <p>Nội dung kho</p>
      </WarehouseWorkspaceLayout>
    )

    expect(screen.getByRole('heading', { name: warehouse.warehouseName })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Thông tin' })).toHaveAttribute(
      'href',
      `/warehouses/${warehouse.id}`
    )
    expect(screen.getByRole('link', { name: 'Bố cục kho' })).toHaveAttribute(
      'href',
      `/warehouses/${warehouse.id}/layout`
    )
    expect(screen.getByRole('link', { name: 'Thông tin' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Chỉnh sửa' })).toBeInTheDocument()
    expect(screen.getByText('Nội dung kho')).toBeInTheDocument()
  })

  it('keeps the workspace readable without owner edit controls for managers', () => {
    currentPathname = `/warehouses/${warehouse.id}/layout`
    setRole(USER_ROLES.WarehouseManager)

    render(
      <WarehouseWorkspaceLayout warehouseId={warehouse.id}>
        <p>Bố cục</p>
      </WarehouseWorkspaceLayout>
    )

    expect(screen.getByRole('link', { name: 'Bố cục kho' })).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('button', { name: 'Chỉnh sửa' })).not.toBeInTheDocument()
    expect(screen.getByText('Bố cục')).toBeInTheDocument()
  })

  it('hides edit controls for an inactive warehouse', () => {
    warehouseData = { ...warehouse, status: 'Inactive' }

    render(
      <WarehouseWorkspaceLayout warehouseId={warehouse.id}>
        <p>Nội dung kho</p>
      </WarehouseWorkspaceLayout>
    )

    expect(screen.queryByRole('button', { name: 'Chỉnh sửa' })).not.toBeInTheDocument()
  })
})
