import { describe, expect, it } from 'vitest'
import { getStaffLifecycleAction, getStaffStatusLabel } from './staff-status'

describe('staff status helpers', () => {
  it('maps active and inactive statuses to supported backend actions', () => {
    expect(getStaffLifecycleAction('Active')).toBe('deactivate')
    expect(getStaffLifecycleAction('Inactive')).toBe('reactivate')
  })

  it('does not invent transitions for pending or locked accounts', () => {
    expect(getStaffLifecycleAction('Pending')).toBeNull()
    expect(getStaffLifecycleAction('Locked')).toBeNull()
  })

  it('keeps unknown backend statuses visible', () => {
    expect(getStaffStatusLabel('Suspended')).toBe('Suspended')
  })
})
