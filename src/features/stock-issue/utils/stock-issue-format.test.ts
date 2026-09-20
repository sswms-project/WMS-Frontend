import { describe, expect, it } from 'vitest'
import type { StockIssueRequestStatus, GoodsReturnRequestStatus } from '../types/stock-issue.types'
import {
  STOCK_ISSUE_REQUEST_STATUS_LABELS,
  RETURN_STATUS_LABELS,
  canApproveGoodsReturnRequest,
  canRecordStockPicking,
  canCreateGoodsReturnRequest,
} from './stock-issue-format'

describe('stock issue state actions', () => {
  it.each(Object.keys(STOCK_ISSUE_REQUEST_STATUS_LABELS) as StockIssueRequestStatus[])(
    'exposes only valid order actions for %s',
    (status) => {
      expect(canRecordStockPicking(status)).toBe(status === 'Pending' || status === 'Picking')
      expect(canCreateGoodsReturnRequest(status)).toBe(status === 'Dispatched')
    }
  )

  it.each(Object.keys(RETURN_STATUS_LABELS) as GoodsReturnRequestStatus[])(
    'exposes approval only for requested goods return requests (%s)',
    (status) => {
      expect(canApproveGoodsReturnRequest(status)).toBe(status === 'Requested')
    }
  )
})
