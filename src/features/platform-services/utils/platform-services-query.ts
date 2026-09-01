import { NOTIFICATION_TYPES } from '../types/platform-services.types'
import type {
  AuditLogQuery,
  NotificationQuery,
  NotificationType,
} from '../types/platform-services.types'

export const PLATFORM_SERVICES_PAGE_SIZE = 20

export function toUtcStart(date: string | null): string | undefined {
  if (!isValidDateInput(date)) return undefined
  return new Date(`${date}T00:00:00.000Z`).toISOString()
}

export function toUtcExclusiveEnd(date: string | null): string | undefined {
  if (!isValidDateInput(date)) return undefined
  const result = new Date(`${date}T00:00:00.000Z`)
  result.setUTCDate(result.getUTCDate() + 1)
  return result.toISOString()
}

function isValidDateInput(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

export function buildNotificationQuery(params: URLSearchParams): NotificationQuery {
  const readState = params.get('readState')
  const typeValue = params.get('type')
  const type = isNotificationType(typeValue) ? typeValue : undefined
  return {
    pageNumber: positivePage(params.get('page')),
    pageSize: PLATFORM_SERVICES_PAGE_SIZE,
    ...(trimmed(params.get('search')) ? { search: trimmed(params.get('search')) } : {}),
    ...(readState === 'read' ? { isRead: true } : {}),
    ...(readState === 'unread' ? { isRead: false } : {}),
    ...(type ? { type } : {}),
    ...(toUtcStart(params.get('dateFrom')) ? { dateFrom: toUtcStart(params.get('dateFrom')) } : {}),
    ...(toUtcExclusiveEnd(params.get('dateTo'))
      ? { dateTo: toUtcExclusiveEnd(params.get('dateTo')) }
      : {}),
  }
}

export function buildAuditLogQuery(params: URLSearchParams): AuditLogQuery {
  const entityId = trimmed(params.get('entityId'))
  const userId = trimmed(params.get('userId'))
  return {
    pageNumber: positivePage(params.get('page')),
    pageSize: PLATFORM_SERVICES_PAGE_SIZE,
    ...stringFilter(params, 'search'),
    ...stringFilter(params, 'action'),
    ...stringFilter(params, 'entityType'),
    ...(entityId && isUuid(entityId) ? { entityId } : {}),
    ...(userId && isUuid(userId) ? { userId } : {}),
    ...(toUtcStart(params.get('dateFrom')) ? { dateFrom: toUtcStart(params.get('dateFrom')) } : {}),
    ...(toUtcExclusiveEnd(params.get('dateTo'))
      ? { dateTo: toUtcExclusiveEnd(params.get('dateTo')) }
      : {}),
  }
}

function positivePage(value: string | null): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function trimmed(value: string | null): string | undefined {
  const result = value?.trim()
  return result ? result : undefined
}

function stringFilter(params: URLSearchParams, key: string): Record<string, string> {
  const value = trimmed(params.get(key))
  return value ? { [key]: value } : {}
}

function isNotificationType(value: string | null): value is NotificationType {
  return value !== null && NOTIFICATION_TYPES.some((type) => type === value)
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
