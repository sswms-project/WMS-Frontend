import { AUDIT_LOG_TIME_RANGES, NOTIFICATION_TYPES } from '../types/platform-services.types'
import type {
  AuditLogQuery,
  AuditLogTimeRange,
  NotificationQuery,
  NotificationType,
} from '../types/platform-services.types'

export const PLATFORM_SERVICES_PAGE_SIZE = 20

export function toUtcStart(date: string | null): string | undefined {
  const localDate = parseLocalDate(date)
  return localDate?.toISOString()
}

export function toUtcExclusiveEnd(date: string | null): string | undefined {
  const localDate = parseLocalDate(date)
  if (!localDate) return undefined
  return new Date(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate() + 1
  ).toISOString()
}

function parseLocalDate(value: string | null): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')
  if (!match) return undefined
  const [, yearValue = '', monthValue = '', dayValue = ''] = match
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined
}

export function buildNotificationQuery(params: URLSearchParams): NotificationQuery {
  const readState = params.get('readState')
  const typeValue = params.get('type')
  const type = isNotificationType(typeValue) ? typeValue : undefined
  return {
    pageNumber: positivePage(params.get('page')),
    pageSize: positivePageSize(params.get('pageSize')),
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
  const dateRange = resolveAuditLogDateRange(params)
  return {
    pageNumber: positivePage(params.get('page')),
    pageSize: positivePageSize(params.get('pageSize')),
    ...stringFilter(params, 'search'),
    ...stringFilter(params, 'action'),
    ...stringFilter(params, 'entityType'),
    ...(entityId && isUuid(entityId) ? { entityId } : {}),
    ...(userId && isUuid(userId) ? { userId } : {}),
    ...(toUtcStart(dateRange.dateFrom) ? { dateFrom: toUtcStart(dateRange.dateFrom) } : {}),
    ...(toUtcExclusiveEnd(dateRange.dateTo) ? { dateTo: toUtcExclusiveEnd(dateRange.dateTo) } : {}),
  }
}

export function resolveAuditLogDateRange(
  params: URLSearchParams,
  now = new Date()
): { dateFrom: string; dateTo: string } {
  const value = params.get('timeRange')
  const timeRange: AuditLogTimeRange =
    AUDIT_LOG_TIME_RANGES.find((item) => item === value) ?? 'this-week'
  if (timeRange === 'custom') {
    return {
      dateFrom: params.get('dateFrom') ?? '',
      dateTo: params.get('dateTo') ?? '',
    }
  }

  const today = startOfDay(now)
  const monday = addDays(today, -((today.getDay() + 6) % 7))
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
  const yearStart = new Date(today.getFullYear(), 0, 1)
  const ranges: Record<Exclude<AuditLogTimeRange, 'custom'>, [Date, Date]> = {
    today: [today, today],
    'this-week': [monday, addDays(monday, 6)],
    'week-to-date': [monday, today],
    'this-month': [monthStart, new Date(today.getFullYear(), today.getMonth() + 1, 0)],
    'month-to-date': [monthStart, today],
    'this-quarter': [
      quarterStart,
      new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0),
    ],
    'quarter-to-date': [quarterStart, today],
    'this-year': [yearStart, new Date(today.getFullYear(), 11, 31)],
    'year-to-date': [yearStart, today],
  }
  const [dateFrom, dateTo] = ranges[timeRange]
  return { dateFrom: formatLocalDate(dateFrom), dateTo: formatLocalDate(dateTo) }
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function addDays(value: Date, days: number): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + days)
}

function formatLocalDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function positivePage(value: string | null): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function positivePageSize(value: string | null): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 100
    ? parsed
    : PLATFORM_SERVICES_PAGE_SIZE
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
