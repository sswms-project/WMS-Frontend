import { describe, expect, it } from 'vitest'
import type { TransferStatus } from '../types/transfer.types'
import {
  TRANSFER_STATUS_LABELS,
  canApproveTransfer,
  canDispatchTransfer,
  canReceiveTransfer,
} from './transfer-format'

const statuses = Object.keys(TRANSFER_STATUS_LABELS) as TransferStatus[]

describe('transfer state actions', () => {
  it.each(statuses)('exposes only valid actions for %s', (status) => {
    expect(canApproveTransfer(status)).toBe(status === 'PendingSourceApproval')
    expect(canDispatchTransfer(status)).toBe(status === 'Approved')
    expect(canReceiveTransfer(status)).toBe(status === 'InTransit')
  })
})
