import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WarehouseList } from './WarehouseList'

describe('WarehouseList', () => {
  it('links the warehouse name to its detail page on desktop and mobile', () => {
    render(
      <WarehouseList
        warehouses={[
          {
            id: 'warehouse-1',
            warehouseCode: 'KHO-01',
            warehouseName: 'Kho trung tâm',
            address: 'Hà Nội',
            status: 'Active',
            createdAt: '2026-10-01T00:00:00Z',
          },
        ]}
      />
    )

    const warehouseNameLinks = screen.getAllByRole('link', { name: 'Kho trung tâm' })
    expect(warehouseNameLinks).toHaveLength(2)
    warehouseNameLinks.forEach((link) =>
      expect(link).toHaveAttribute('href', '/warehouses/warehouse-1')
    )
  })
})
