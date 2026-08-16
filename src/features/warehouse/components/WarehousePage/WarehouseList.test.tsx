import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WarehouseList } from './WarehouseList'

describe('WarehouseList', () => {
  it('uses a navigable detail link for each warehouse', () => {
    render(
      <WarehouseList
        warehouses={[
          {
            id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
            warehouseCode: 'HCM-01',
            warehouseName: 'Kho Thủ Đức',
            address: 'Thủ Đức, Hồ Chí Minh',
            status: 'Active',
            createdAt: '2026-08-09T00:00:00.000Z',
          },
        ]}
      />
    )

    const detailLinks = screen.getAllByRole('link', { name: 'Xem chi tiết Kho Thủ Đức' })

    expect(detailLinks).toHaveLength(2)
    detailLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/warehouses/497f6eca-6276-4993-bfeb-53cbbbba6f08')
    })
  })
})
