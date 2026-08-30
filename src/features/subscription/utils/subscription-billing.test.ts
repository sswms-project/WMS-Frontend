import { describe, expect, it } from 'vitest'
import type {
  PaymentHistoryFilterState,
  SubscriptionPlanResponse,
  SubscriptionStatusResponse,
} from '../types/subscription.types'
import {
  buildInvoiceFileName,
  formatHistoricalPlanName,
  formatInvoiceSnapshotValue,
  getMonthlyEquivalent,
  getPlanPrice,
  hasPendingSubscriptionChange,
  isCancelledSubscription,
  isCompletedPayment,
  shouldShowRenewAction,
} from './format-subscription'
import { buildPaymentHistoryQuery, isInvalidPaymentDateRange } from './payment-history-query'
import { getPlanActionState, isDowngradePlan } from './subscription-eligibility'

function createPlan(overrides: Partial<SubscriptionPlanResponse>): SubscriptionPlanResponse {
  return {
    id: 'plan-id',
    planName: 'Standard',
    monthlyPrice: 100000,
    yearlyPrice: 1080000,
    yearlyDiscountPercent: 10,
    displayOrder: 1,
    features: [],
    status: 'Active',
    ...overrides,
  }
}

function createSubscription(
  overrides: Partial<SubscriptionStatusResponse>
): SubscriptionStatusResponse {
  return {
    id: 'subscription-id',
    planName: 'Current',
    planPrice: 200000,
    billingCycle: 'Monthly',
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-09-01T00:00:00Z',
    status: 'Active',
    autoRenew: true,
    isExpired: false,
    daysRemaining: 20,
    ...overrides,
  }
}

describe('subscription billing helpers', () => {
  it('builds payment history query with paging and selected filters only', () => {
    const filters: PaymentHistoryFilterState = {
      searchText: ' INV-001 ',
      planId: 'plan-123',
      status: 'Completed',
      dateFrom: new Date(2026, 7, 5, 12, 20, 10),
      dateTo: new Date(2026, 7, 6, 8, 0, 0),
    }

    const query = buildPaymentHistoryQuery(filters, 2, 10)

    expect(query.top).toBe(10)
    expect(query.skip).toBe(20)
    expect(query.searchText).toBe('INV-001')
    expect(query.planId).toBe('plan-123')
    expect(query.status).toBe('Completed')
    expect(query.dateFrom).toContain('2026-08-05T00:00:00')
    expect(query.dateTo).toContain('2026-08-06T23:59:59')
  })

  it('omits all-plan and all-status filters', () => {
    const query = buildPaymentHistoryQuery({ searchText: ' ', planId: 'all', status: 'all' }, 0, 10)

    expect(query.searchText).toBeUndefined()
    expect(query.planId).toBeUndefined()
    expect(query.status).toBeUndefined()
  })

  it('detects invalid date ranges', () => {
    expect(
      isInvalidPaymentDateRange({
        searchText: '',
        planId: 'all',
        status: 'all',
        dateFrom: new Date(2026, 7, 7),
        dateTo: new Date(2026, 7, 6),
      })
    ).toBe(true)
  })

  it('identifies completed payments case-insensitively', () => {
    expect(isCompletedPayment('Completed')).toBe(true)
    expect(isCompletedPayment('completed')).toBe(true)
    expect(isCompletedPayment('Pending')).toBe(false)
  })

  it('uses historical invoice fallbacks without current-plan substitution', () => {
    expect(formatHistoricalPlanName(null)).toBe('Không xác định')
    expect(formatInvoiceSnapshotValue(null)).toBe('Không có dữ liệu lịch sử')
    expect(buildInvoiceFileName('')).toBe('invoice.pdf')
  })

  it('blocks only lower-price plan changes', () => {
    expect(isDowngradePlan(200000, createPlan({ monthlyPrice: 100000 }), 'Monthly')).toBe(true)
    expect(
      isDowngradePlan(100000, createPlan({ monthlyPrice: 100000, id: 'same-price' }), 'Monthly')
    ).toBe(false)
    expect(isDowngradePlan(undefined, createPlan({ monthlyPrice: 100000 }), 'Monthly')).toBe(false)
  })

  it('returns accessible action copy for current, downgrade, and pending plans', () => {
    const currentPlan = createPlan({ id: 'current', planName: 'Current', monthlyPrice: 200000 })
    const subscription = {
      id: 'subscription-id',
      planName: 'Current',
      planPrice: 200000,
      billingCycle: 'Monthly',
      startDate: '2026-08-01T00:00:00Z',
      endDate: '2026-09-01T00:00:00Z',
      status: 'Active',
      autoRenew: true,
      isExpired: false,
      daysRemaining: 8,
    }

    expect(
      getPlanActionState(
        createPlan({ id: 'current', monthlyPrice: 200000 }),
        currentPlan,
        subscription,
        'Monthly',
        false
      )
    ).toEqual({
      disabled: true,
      label: 'Đang sử dụng',
    })

    expect(
      getPlanActionState(
        createPlan({ id: 'lower', monthlyPrice: 100000 }),
        currentPlan,
        subscription,
        'Monthly',
        false
      )
    ).toEqual({
      disabled: false,
      label: 'Chuyển vào kỳ sau',
      tooltip: 'Gói có giá thấp hơn sẽ được áp dụng từ kỳ thanh toán kế tiếp.',
    })

    expect(
      getPlanActionState(
        createPlan({ id: 'higher', monthlyPrice: 300000 }),
        currentPlan,
        subscription,
        'Monthly',
        true
      )
    ).toEqual({
      disabled: true,
      label: 'Đang xử lý…',
    })
  })

  it('selects prices and monthly equivalents for both billing cycles', () => {
    const plan = createPlan({ monthlyPrice: 100000, yearlyPrice: 960000 })

    expect(getPlanPrice(plan, 'Monthly')).toBe(100000)
    expect(getPlanPrice(plan, 'Yearly')).toBe(960000)
    expect(getMonthlyEquivalent(plan, 'Yearly')).toBe(80000)
  })

  it('treats a subscription as cancelled from its status or from a cancellation timestamp', () => {
    expect(isCancelledSubscription(createSubscription({ status: 'Cancelled' }))).toBe(true)
    expect(isCancelledSubscription(createSubscription({ status: 'Canceled' }))).toBe(true)
    expect(
      isCancelledSubscription(
        createSubscription({ status: 'Active', cancelledAt: '2026-08-30T11:17:03Z' })
      )
    ).toBe(true)
    expect(
      isCancelledSubscription(createSubscription({ status: 'Active', cancelledAt: null }))
    ).toBe(false)
    expect(isCancelledSubscription(undefined)).toBe(false)
  })

  it('hides the renew action for a cancelled subscription even when it is also near expiry', () => {
    expect(
      shouldShowRenewAction(
        createSubscription({
          status: 'Active',
          cancelledAt: '2026-08-30T11:17:03Z',
          daysRemaining: 2,
        })
      )
    ).toBe(false)
    expect(shouldShowRenewAction(createSubscription({ isExpired: true }))).toBe(true)
    expect(shouldShowRenewAction(createSubscription({ daysRemaining: 2 }))).toBe(true)
    expect(shouldShowRenewAction(createSubscription({ daysRemaining: 20 }))).toBe(false)
    expect(shouldShowRenewAction(undefined)).toBe(false)
  })

  it('detects a pending plan or billing-cycle change independently of each other', () => {
    expect(hasPendingSubscriptionChange(createSubscription({ pendingPlanName: 'Plus' }))).toBe(true)
    expect(
      hasPendingSubscriptionChange(createSubscription({ pendingBillingCycle: 'Monthly' }))
    ).toBe(true)
    expect(
      hasPendingSubscriptionChange(
        createSubscription({ pendingPlanName: null, pendingBillingCycle: null })
      )
    ).toBe(false)
    expect(hasPendingSubscriptionChange(undefined)).toBe(false)
  })
})
