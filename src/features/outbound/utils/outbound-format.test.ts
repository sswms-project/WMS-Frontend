import { describe, expect, it } from 'vitest'
import type { OutboundOrderStatus, ReturnStatus } from '../types/outbound.types'
import {
  OUTBOUND_ORDER_STATUS_LABELS,
  RETURN_STATUS_LABELS,
  canApproveReturn,
  canIssueStock,
  canRecordReturn,
} from './outbound-format'

describe('outbound state actions', () => {
  it.each(Object.keys(OUTBOUND_ORDER_STATUS_LABELS) as OutboundOrderStatus[])(
    'exposes only valid order actions for %s',
    (status) => {
      expect(canIssueStock(status)).toBe(status === 'Pending' || status === 'Picking')
      expect(canRecordReturn(status)).toBe(status === 'Delivered' || status === 'Failed')
    }
  )

  it.each(Object.keys(RETURN_STATUS_LABELS) as ReturnStatus[])(
    'exposes approval only for requested returns (%s)',
    (status) => {
      expect(canApproveReturn(status)).toBe(status === 'Requested')
    }
  )
})
