import { P } from '@/config/permissionCodes'

export const AUDIT_LOG_VIEW_PERMISSION = P.AUDIT_LOGS_VIEW

export function canViewAuditLogs(permissions: readonly string[]): boolean {
  return permissions.includes(AUDIT_LOG_VIEW_PERMISSION)
}
