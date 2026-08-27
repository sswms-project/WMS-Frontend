import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CycleCountDirectory } from './CycleCountDirectory'
import type { CycleCountSummary } from '../types/cycle-count.types'

const item: CycleCountSummary = {
  id: 'count-1',
  warehouseId: 'warehouse-1',
  warehouseName: 'Kho trung tâm',
  zoneId: null,
  status: 'Counting',
  scheduledDate: '2026-08-25T10:00:00Z',
  isBlindCount: true,
  assignedTo: 'staff-1',
  assignedToName: 'Nguyễn Văn A',
  itemCount: 10,
  countedItemCount: 4,
  createdAt: '2026-08-25T09:00:00Z',
}

function renderDirectory(overrides: Partial<ComponentProps<typeof CycleCountDirectory>> = {}) {
  render(
    <CycleCountDirectory
      permissions={['cycle-counts:view', 'stock-adjustments:view']}
      items={[]}
      totalCount={0}
      page={1}
      pageSize={20}
      warehouseId=""
      status=""
      warehouses={[]}
      canCreate
      isLoading={false}
      isFetching={false}
      isError={false}
      onWarehouseChange={vi.fn()}
      onStatusChange={vi.fn()}
      onPageChange={vi.fn()}
      onRetry={vi.fn()}
      {...overrides}
    />
  )
}

describe('CycleCountDirectory states', () => {
  it('renders loading state', () => {
    renderDirectory({ isLoading: true })
    expect(screen.getByLabelText('Đang tải dữ liệu')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    renderDirectory()
    expect(screen.getByText('Chưa có phiếu kiểm kê')).toBeInTheDocument()
  })

  it('renders error state', () => {
    renderDirectory({ isError: true })
    expect(screen.getByText('Không thể tải danh sách kiểm kê')).toBeInTheDocument()
  })

  it('renders populated blind-count state and progress', () => {
    renderDirectory({ items: [item], totalCount: 1 })
    expect(screen.getByText('Kho trung tâm')).toBeInTheDocument()
    expect(screen.getByText(/Blind count/)).toBeInTheDocument()
    expect(screen.getByText('4/10')).toBeInTheDocument()
  })
})
