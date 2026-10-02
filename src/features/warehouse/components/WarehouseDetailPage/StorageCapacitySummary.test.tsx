import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StorageCapacitySummary } from './StorageCapacitySummary'

describe('StorageCapacitySummary', () => {
  it.each([
    [0, 'Còn chỗ'],
    [16, 'Sắp đầy'],
    [20, 'Đã đầy'],
  ])('shows normalized usage %s with an accessible status', (used, status) => {
    render(
      <StorageCapacitySummary
        location={{
          capacityType: 'Quantity',
          capacity: 20,
          capacityUsed: used,
          currentOccupancy: used * 24,
          remainingCapacity: 20 - used,
          capacityUnitName: 'Thùng',
        }}
      />
    )
    const progress = screen.getByRole('progressbar', { name: 'Mức sử dụng sức chứa' })
    expect(progress).toHaveAttribute('aria-valuenow', String(used))
    expect(progress).toHaveAttribute('aria-valuemax', '20')
    expect(progress.getAttribute('aria-valuetext')).toContain(status)
  })
  it.each([
    { capacityType: 'None' as const },
    { capacityType: 'Quantity' as const, requiresCapacityConfiguration: true },
  ])('omits misleading progress for unlimited/pending', (location) => {
    render(<StorageCapacitySummary location={location} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
