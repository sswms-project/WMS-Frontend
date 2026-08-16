import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WarehouseOverview } from './WarehouseOverview'

describe('WarehouseOverview', () => {
  it('shows both the created and last modified timestamps', () => {
    render(
      <WarehouseOverview
        warehouse={{
          id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
          warehouseCode: 'HCM-01',
          warehouseName: 'Kho Thủ Đức',
          address: 'Thủ Đức, Hồ Chí Minh',
          status: 'Active',
          zoneCount: 2,
          createdAt: '2026-08-09T00:00:00.000Z',
          modifiedAt: '2026-08-09T01:00:00.000Z',
        }}
      />
    )

    expect(screen.getByText('Ngày tạo')).toBeInTheDocument()
    expect(screen.getByText('Cập nhật gần nhất')).toBeInTheDocument()
  })
})
