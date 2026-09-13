export const AUDIT_LOG_VIEW_PERMISSION = 'audit-logs:view'

export function canViewAuditLogs(permissions: readonly string[]): boolean {
  return permissions.includes(AUDIT_LOG_VIEW_PERMISSION)
}
