import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StaffDetailsSheet } from './StaffDetailsSheet'

const managerAssignmentHooks = vi.hoisted(() => ({
  useAssignmentWarehousesQuery: vi.fn(),
}))

vi.mock('../../hooks/use-manager-assignment', () => managerAssignmentHooks)

describe('StaffDetailsSheet', () => {
  it('shows the warehouse managed by a warehouse manager', () => {
    managerAssignmentHooks.useAssignmentWarehousesQuery.mockReturnValue({
      data: {
        items: [
          {
            id: 'warehouse-1',
            warehouseCode: 'HCM-01',
            warehouseName: 'Kho Thu Duc',
            address: 'Ho Chi Minh City',
            status: 'Active',
            createdAt: '2026-08-19T00:00:00Z',
          },
        ],
        totalCount: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    render(
      <StaffDetailsSheet
        open
        person={{
          id: 'manager-1',
          fullName: 'Warehouse Manager Demo',
          email: 'warehouse.manager@sswms.local',
          phone: null,
          role: 'Warehouse Manager',
          status: 'Active',
          lastLoginAt: null,
          assignedWarehouseIds: ['warehouse-1'],
        }}
        isLoading={false}
        isError={false}
        onOpenChange={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Kho đang phụ trách' })).toBeInTheDocument()
    expect(screen.getByText('HCM-01')).toBeInTheDocument()
    expect(screen.getByText('Kho Thu Duc')).toBeInTheDocument()
  })
})
