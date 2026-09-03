import { describe, expect, it } from 'vitest'
import { canViewAuditLogs } from './platform-services-permissions'

describe('Platform Services permissions', () => {
  it('requires the effective audit log permission', () => {
    expect(canViewAuditLogs(['audit-logs:view'])).toBe(true)
    expect(canViewAuditLogs(['notifications:view'])).toBe(false)
  })
})
