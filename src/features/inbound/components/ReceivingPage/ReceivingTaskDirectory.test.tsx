import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { ReceivingTask } from '../../types/inbound.types'
import { ReceivingTaskDirectory } from './ReceivingTaskDirectory'

const STAFF_ID = 'staff-1'

function task(overrides: Partial<ReceivingTask> = {}): ReceivingTask {
  return {
    inboundRequestId: 'ir-1',
    inboundRequestCode: 'IR-001',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Ngũ Kim 1',
    supplierId: 'sup-1',
    supplierName: 'Nhà cung cấp A',
    expectedDate: null,
    orderedQuantity: 10,
    receivedQuantity: 0,
    remainingQuantity: 10,
    activeDocumentImportId: null,
    assignedTo: null,
    assignedToName: null,
    assignedAt: null,
    executionStatus: 'Queued',
    lines: [],
    ...overrides,
  }
}

function renderDirectory(
  items: ReceivingTask[],
  options: { canAssign: boolean; currentUserId: string | null }
) {
  const handlers = { onAssign: vi.fn(), onReceive: vi.fn() }
  render(
    <TooltipProvider>
      <ReceivingTaskDirectory
        items={items}
        totalCount={items.length}
        page={1}
        pageSize={10}
        searchText=""
        isLoading={false}
        isFetching={false}
        isError={false}
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        onReceive={handlers.onReceive}
        onImportDocument={vi.fn()}
        onRetry={vi.fn()}
        currentUserId={options.currentUserId}
        canAssign={options.canAssign}
        assignmentFilter="all"
        onAssignmentFilterChange={vi.fn()}
        onAssign={handlers.onAssign}
      />
    </TooltipProvider>
  )
  return handlers
}

function desktopTable() {
  return screen.getByRole('table')
}

describe('ReceivingTaskDirectory assignment', () => {
  it('lets managers assign unassigned tasks without receiving goods themselves', async () => {
    const handlers = renderDirectory([task()], { canAssign: true, currentUserId: 'manager-1' })
    const table = desktopTable()

    expect(within(table).getByText('Chưa giao')).toBeInTheDocument()
    expect(within(table).queryByRole('button', { name: /Nhập thủ công/ })).not.toBeInTheDocument()
    await userEvent.click(within(table).getByRole('button', { name: /Giao việc/ }))
    expect(handlers.onAssign).toHaveBeenCalledWith(
      expect.objectContaining({ inboundRequestId: 'ir-1' })
    )
  })

  it('offers reassignment when the task already has an assignee', () => {
    renderDirectory([task({ assignedTo: STAFF_ID, assignedToName: 'Hoàng Minh Vũ' })], {
      canAssign: true,
      currentUserId: 'manager-1',
    })
    const table = desktopTable()

    expect(within(table).getByText('Hoàng Minh Vũ')).toBeInTheDocument()
    expect(within(table).getByRole('button', { name: /Giao lại/ })).toBeInTheDocument()
  })

  it('shows receiving actions only to the assigned staff member', () => {
    renderDirectory(
      [
        task({
          assignedTo: STAFF_ID,
          assignedToName: 'Hoàng Minh Vũ',
          executionStatus: 'InProgress',
        }),
      ],
      { canAssign: false, currentUserId: STAFF_ID }
    )
    const table = desktopTable()

    expect(within(table).getByRole('button', { name: /Nhập thủ công/ })).toBeInTheDocument()
    expect(within(table).getByText('Đang làm')).toBeInTheDocument()
    expect(within(table).queryByRole('button', { name: /Giao/ })).not.toBeInTheDocument()
  })

  it('blocks staff from receiving tasks assigned to someone else', () => {
    renderDirectory([task({ assignedTo: 'staff-2', assignedToName: 'Người khác' })], {
      canAssign: false,
      currentUserId: STAFF_ID,
    })
    const table = desktopTable()

    expect(within(table).queryByRole('button', { name: /Nhập thủ công/ })).not.toBeInTheDocument()
    expect(within(table).getByText('Chờ quản lý giao việc')).toBeInTheDocument()
  })
})
