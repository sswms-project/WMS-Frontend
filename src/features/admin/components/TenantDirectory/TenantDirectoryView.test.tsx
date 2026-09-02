import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TenantDirectoryView } from './TenantDirectoryView'

describe('TenantDirectoryView', () => {
  it('shows an explicit empty state and keeps filters labelled', () => {
    render(
      <TenantDirectoryView
        items={[]}
        plans={[]}
        totalCount={0}
        page={1}
        pageSize={20}
        search=""
        sortBy="createdAt"
        isLoading={false}
        isFetching={false}
        isError={false}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
        onSubscriptionStatusChange={vi.fn()}
        onPlanChange={vi.fn()}
        onSortChange={vi.fn()}
        onPageChange={vi.fn()}
        onClear={vi.fn()}
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByText('Không có tenant phù hợp')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Tìm tenant')).toHaveLength(2)
    expect(screen.getByLabelText('Trạng thái tenant')).toBeInTheDocument()
  })
})
