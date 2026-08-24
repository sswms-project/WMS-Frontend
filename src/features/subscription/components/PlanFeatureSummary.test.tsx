import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { SubscriptionPlanResponse } from '../types/subscription.types'
import { PlanFeatureSummary } from './PlanFeatureSummary'

const plan: SubscriptionPlanResponse = {
  id: 'professional',
  planName: 'Professional',
  monthlyPrice: 500000,
  yearlyPrice: 5100000,
  yearlyDiscountPercent: 15,
  displayOrder: 2,
  status: 'Active',
  features: [
    { featureCode: 'Warehouses', displayName: 'Kho hàng', featureType: 'Limit', limitValue: 5 },
    { featureCode: 'Users', displayName: 'Người dùng', featureType: 'Limit', limitValue: 20 },
    { featureCode: 'Barcode', displayName: 'Mã vạch', featureType: 'Boolean' },
    {
      featureCode: 'Forecasting',
      displayName: 'Dự báo',
      featureType: 'Boolean',
      description: 'Dự báo nhu cầu tồn kho.',
    },
  ],
}

describe('PlanFeatureSummary', () => {
  it('keeps the card preview compact and exposes the complete feature list in a dialog', async () => {
    const user = userEvent.setup()

    render(<PlanFeatureSummary plan={plan} />)

    expect(screen.queryByText('Dự báo')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Xem tất cả 4 quyền lợi' }))

    expect(screen.getByRole('dialog', { name: 'Quyền lợi gói Professional' })).toBeInTheDocument()
    expect(screen.getByText('Dự báo')).toBeInTheDocument()
    expect(screen.getByText('Dự báo nhu cầu tồn kho.')).toBeInTheDocument()
  })
})
