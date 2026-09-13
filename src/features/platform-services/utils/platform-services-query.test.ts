import { describe, expect, it } from 'vitest'
import {
  auditLogFiltersSchema,
  notificationCreatedEventSchema,
  notificationFiltersSchema,
} from '../schemas/platform-services.schema'
import { NOTIFICATION_TYPES } from '../types/platform-services.types'
import { getNotificationReferenceRoute } from './platform-services-format'
import {
  buildAuditLogQuery,
  buildNotificationQuery,
  toUtcStart,
  toUtcExclusiveEnd,
} from './platform-services-query'

describe('Platform Services query builders', () => {
  it('normalizes notification filters and uses an exclusive UTC end date', () => {
    const query = buildNotificationQuery(
      new URLSearchParams(
        'search=%20failed%20&type=DeliveryUpdate&readState=unread&dateFrom=2026-08-01&dateTo=2026-08-31&page=2'
      )
    )
    expect(query).toEqual({
      search: 'failed',
      type: 'DeliveryUpdate',
      isRead: false,
      dateFrom: new Date(2026, 7, 1).toISOString(),
      dateTo: new Date(2026, 8, 1).toISOString(),
      pageNumber: 2,
      pageSize: 20,
    })
  })

  it('omits empty audit filters and repairs an invalid page', () => {
    expect(buildAuditLogQuery(new URLSearchParams('search=%20&page=-2&action=Approve'))).toEqual({
      action: 'Approve',
      pageNumber: 1,
      pageSize: 20,
    })
  })

  it('rolls the exclusive end across month boundaries', () => {
    expect(toUtcStart('2026-02-28')).toBe(new Date(2026, 1, 28).toISOString())
    expect(toUtcExclusiveEnd('2026-02-28')).toBe(new Date(2026, 2, 1).toISOString())
    expect(toUtcExclusiveEnd('not-a-date')).toBeUndefined()
    expect(toUtcStart('2026-02-30')).toBeUndefined()
  })

  it('matches backend validation limits and rejects invalid date ranges', () => {
    expect(
      notificationFiltersSchema.safeParse({ search: 'x'.repeat(256), readState: 'all' }).success
    ).toBe(false)
    expect(auditLogFiltersSchema.safeParse({ action: 'x'.repeat(101) }).success).toBe(false)
    expect(
      notificationFiltersSchema.safeParse({
        readState: 'all',
        dateFrom: '2026-09-02',
        dateTo: '2026-09-01',
      }).success
    ).toBe(false)
  })

  it('routes only explicitly supported reference types', () => {
    const routeFor = (
      type:
        | 'POUpdate'
        | 'InboundUpdate'
        | 'StockAdjustmentUpdate'
        | 'CycleCountUpdate'
        | 'WarehouseUpdate'
        | 'LowStock'
        | 'TransferUpdate'
        | 'OutboundUpdate'
        | 'DeliveryUpdate'
        | 'ReturnUpdate',
      referenceType: string,
      referenceId = 'id-1'
    ) => getNotificationReferenceRoute({ type, referenceType, referenceId })

    expect(routeFor('POUpdate', 'PurchaseOrder', 'po-1')).toBe('/purchase-orders/po-1')
    expect(routeFor('InboundUpdate', 'InboundReceipt')).toBe('/inbound/receipts/id-1')
    expect(routeFor('StockAdjustmentUpdate', 'StockAdjustment')).toBe(
      '/inventory/stock-adjustments/id-1'
    )
    expect(routeFor('CycleCountUpdate', 'CycleCount')).toBe('/inventory/cycle-counts/id-1')
    expect(routeFor('WarehouseUpdate', 'Warehouse')).toBe('/warehouses/id-1')
    expect(routeFor('LowStock', 'Product')).toBe('/products/id-1')
    expect(routeFor('TransferUpdate', 'StockTransfer')).toBe('/transfers')
    expect(routeFor('OutboundUpdate', 'OutboundOrder')).toBe('/orders')
    expect(routeFor('DeliveryUpdate', 'OutboundOrder')).toBe('/delivery')
    expect(routeFor('ReturnUpdate', 'Return')).toBe('/returns')
    expect(routeFor('POUpdate', 'UnknownType')).toBeNull()
  })

  it('accepts every backend notification type in realtime events', () => {
    for (const type of NOTIFICATION_TYPES) {
      expect(
        notificationCreatedEventSchema.safeParse({
          notificationId: 'ea065311-734b-4f55-8d85-b43a68480c58',
          type,
          createdAt: '2026-09-04T03:00:00Z',
        }).success
      ).toBe(true)
    }
  })
})
