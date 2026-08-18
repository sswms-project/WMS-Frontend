import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ManagerWarehouseAssignmentDialog } from './ManagerWarehouseAssignmentDialog'

const managerAssignmentHooks = vi.hoisted(() => ({
  useAssignmentWarehousesQuery: vi.fn(),
  useAssignManagerMutation: vi.fn(),
}))

vi.mock('../../hooks/use-manager-assignment', () => managerAssignmentHooks)

vi.mock('@/hooks/use-debounced-value', () => ({
  useDebouncedValue: (value: string) => value,
}))

describe('ManagerWarehouseAssignmentDialog', () => {
  beforeEach(() => {
    managerAssignmentHooks.useAssignmentWarehousesQuery.mockReturnValue({
      data: {
        items: [
          {
            id: 'active-warehouse',
            warehouseCode: 'HCM-01',
            warehouseName: 'Kho Thu Duc',
            address: 'Ho Chi Minh City',
            status: 'Active',
            createdAt: '2026-08-19T00:00:00Z',
          },
          {
            id: 'inactive-warehouse',
            warehouseCode: 'HN-01',
            warehouseName: 'Kho Ha Noi',
            address: 'Ha Noi',
            status: 'Inactive',
            createdAt: '2026-08-19T00:00:00Z',
          },
        ],
        totalCount: 2,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    managerAssignmentHooks.useAssignManagerMutation.mockReturnValue({
      error: null,
      isPending: false,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
    })
  })

  it('requests and renders only active warehouses', () => {
    render(
      <ManagerWarehouseAssignmentDialog
        manager={{
          id: 'manager-1',
          fullName: 'Warehouse Manager Demo',
          email: 'warehouse.manager@sswms.local',
          phone: null,
          role: 'Warehouse Manager',
          status: 'Active',
          lastLoginAt: null,
          assignedWarehouseIds: [],
        }}
        onOpenChange={vi.fn()}
      />
    )

    expect(managerAssignmentHooks.useAssignmentWarehousesQuery).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'Active' }),
      true
    )
    expect(screen.getByText('Kho Thu Duc')).toBeInTheDocument()
    expect(screen.queryByText('Kho Ha Noi')).not.toBeInTheDocument()
    expect(screen.getByText('1 kết quả')).toBeInTheDocument()
  })
})
