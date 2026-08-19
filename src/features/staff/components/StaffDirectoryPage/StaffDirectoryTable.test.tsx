import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { STAFF_DIRECTORY_KINDS } from '../../types/staff.types'
import { StaffDirectoryTable } from './StaffDirectoryTable'

describe('StaffDirectoryTable', () => {
  it('shows a manager and the warehouse they manage', () => {
    render(
      <StaffDirectoryTable
        kind={STAFF_DIRECTORY_KINDS.managers}
        people={[
          {
            id: 'manager-1',
            fullName: 'Warehouse Manager Demo',
            email: 'warehouse.manager@sswms.local',
            phone: null,
            role: 'Warehouse Manager',
            status: 'Active',
            lastLoginAt: null,
            assignedWarehouseIds: ['warehouse-1'],
          },
        ]}
        warehouses={[
          {
            id: 'warehouse-1',
            warehouseCode: 'HCM-01',
            warehouseName: 'Kho Thu Duc',
            address: 'Ho Chi Minh City',
            status: 'Active',
            createdAt: '2026-08-19T00:00:00Z',
          },
        ]}
        isWarehouseScopeLoading={false}
        onView={vi.fn()}
        onAssignWarehouse={vi.fn()}
        onLifecycleAction={vi.fn()}
      />
    )

    expect(screen.getAllByText('Warehouse Manager Demo')).not.toHaveLength(0)
    expect(screen.getAllByText('HCM-01 · Kho Thu Duc')).not.toHaveLength(0)
    expect(screen.getByRole('columnheader', { name: 'Phạm vi kho' })).toBeInTheDocument()
    expect(screen.getByRole('table')).toHaveClass('min-w-[960px]', 'table-fixed')
    expect(screen.getByRole('table').parentElement).toHaveClass('overflow-x-auto')
  })

  it('shows the warehouse scope loading state for assigned people', () => {
    render(
      <StaffDirectoryTable
        kind={STAFF_DIRECTORY_KINDS.managers}
        people={[
          {
            id: 'manager-1',
            fullName: 'Warehouse Manager Demo',
            email: 'warehouse.manager@sswms.local',
            phone: null,
            role: 'Warehouse Manager',
            status: 'Active',
            lastLoginAt: null,
            assignedWarehouseIds: ['warehouse-1'],
          },
        ]}
        warehouses={[]}
        isWarehouseScopeLoading
        onView={vi.fn()}
        onAssignWarehouse={vi.fn()}
        onLifecycleAction={vi.fn()}
      />
    )

    expect(screen.getAllByText('Đang tải thông tin kho…')).not.toHaveLength(0)
  })
})
