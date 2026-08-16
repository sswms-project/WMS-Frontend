import { describe, expect, it } from 'vitest'
import type {
  PaymentHistoryFilterState,
  SubscriptionPlanResponse,
} from '../types/subscription.types'
import {
  buildInvoiceFileName,
  formatHistoricalPlanName,
  formatInvoiceSnapshotValue,
  isCompletedPayment,
} from './format-subscription'
import { buildPaymentHistoryQuery, isInvalidPaymentDateRange } from './payment-history-query'
import { getPlanActionState, isDowngradePlan } from './subscription-eligibility'

function createPlan(overrides: Partial<SubscriptionPlanResponse>): SubscriptionPlanResponse {
  return {
    id: 'plan-id',
    planName: 'Standard',
    price: 100000,
    billingCycle: 'Monthly',
    maxWarehouses: 1,
    maxUsers: 5,
    enableForecasting: false,
    enableBarcode: true,
    enableLayoutDesigner: false,
    status: 'Active',
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
    expect(isDowngradePlan(200000, createPlan({ price: 100000 }))).toBe(true)
    expect(isDowngradePlan(100000, createPlan({ price: 100000, id: 'same-price' }))).toBe(false)
    expect(isDowngradePlan(undefined, createPlan({ price: 100000 }))).toBe(false)
  })

  it('returns accessible action copy for current, downgrade, and pending plans', () => {
    const currentPlan = createPlan({ id: 'current', planName: 'Current', price: 200000 })

    expect(
      getPlanActionState(createPlan({ id: 'current', price: 200000 }), currentPlan, false)
    ).toEqual({
      disabled: true,
      label: 'Đang sử dụng',
    })

    expect(
      getPlanActionState(createPlan({ id: 'lower', price: 100000 }), currentPlan, false)
    ).toEqual({
      disabled: true,
      label: 'Không hỗ trợ hạ gói',
      tooltip: 'Không hỗ trợ hạ gói',
    })

    expect(
      getPlanActionState(createPlan({ id: 'higher', price: 300000 }), currentPlan, true)
    ).toEqual({
      disabled: true,
      label: 'Đang xử lý...',
    })
  })
})
