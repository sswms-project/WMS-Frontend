import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  staffQuickActions,
  tenantOwnerQuickActions,
  warehouseManagerQuickActions,
} from '../../utils/sample-data'
import { QuickActionsBar } from './QuickActionsBar'

describe('QuickActionsBar', () => {
  it('disables only tenant write actions when the tenant dashboard is read-only', () => {
    render(
      <TooltipProvider>
        <QuickActionsBar
          actions={tenantOwnerQuickActions}
          readOnly
          readOnlyReason="Subscription đã hết hạn"
        />
      </TooltipProvider>
    )

    expect(screen.getByRole('button', { name: 'Tạo đơn hàng' })).toBeDisabled()
    expect(screen.queryByRole('link', { name: 'Tạo đơn hàng' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem báo cáo' })).toHaveAttribute('href', '/reports')
  })

  it('keeps manager and staff quick actions as enabled links when no guard is supplied', () => {
    render(
      <TooltipProvider>
        <QuickActionsBar actions={warehouseManagerQuickActions} />
        <QuickActionsBar actions={staffQuickActions} />
      </TooltipProvider>
    )

    expect(screen.getByRole('link', { name: 'Tạo phiếu lấy hàng' })).toHaveAttribute(
      'href',
      '/picking-tasks/create'
    )
    expect(screen.getByRole('link', { name: 'Bắt đầu nhiệm vụ' })).toHaveAttribute(
      'href',
      '/tasks/next'
    )
  })
})
