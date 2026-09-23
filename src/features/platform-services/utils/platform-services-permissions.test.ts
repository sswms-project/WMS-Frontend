import { describe, expect, it } from 'vitest'
import { P } from '@/config/permissionCodes'
import { canViewAuditLogs } from './platform-services-permissions'

describe('Platform Services permissions', () => {
  it('requires the effective audit log permission', () => {
    expect(canViewAuditLogs([P.AUDIT_LOGS_VIEW])).toBe(true)
    expect(canViewAuditLogs([P.NOTIFICATIONS_VIEW])).toBe(false)
  })
})
