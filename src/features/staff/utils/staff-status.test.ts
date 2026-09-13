import { describe, expect, it } from 'vitest'
import { getStaffStatusLabel } from './staff-status'

describe('staff status helpers', () => {
  it('maps account statuses to Vietnamese labels', () => {
    expect(getStaffStatusLabel('AccountInactive')).toBe('Tài khoản bị vô hiệu hóa toàn hệ thống')
    expect(getStaffStatusLabel('Terminated')).toBe('Đã chấm dứt làm việc')
  })

  it('keeps unknown backend statuses visible', () => {
    expect(getStaffStatusLabel('Suspended')).toBe('Suspended')
  })
})
