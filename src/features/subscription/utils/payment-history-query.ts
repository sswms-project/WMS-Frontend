import { OrderType } from '@/types/api'
import type { PaymentHistoryFilterState, PaymentHistoryQuery } from '../types/subscription.types'

function padDatePart(value: number): string {
  return value.toString().padStart(2, '0')
}

function formatLocalDateTimeOffset(date: Date, endOfDay: boolean): string {
  const localDate = new Date(date)
  if (endOfDay) {
    localDate.setHours(23, 59, 59, 999)
  } else {
    localDate.setHours(0, 0, 0, 0)
  }

  const offsetMinutes = -localDate.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteOffsetMinutes = Math.abs(offsetMinutes)
  const offsetHours = Math.floor(absoluteOffsetMinutes / 60)
  const offsetRemainderMinutes = absoluteOffsetMinutes % 60

  return [
    localDate.getFullYear(),
    '-',
    padDatePart(localDate.getMonth() + 1),
    '-',
    padDatePart(localDate.getDate()),
    'T',
    padDatePart(localDate.getHours()),
    ':',
    padDatePart(localDate.getMinutes()),
    ':',
    padDatePart(localDate.getSeconds()),
    sign,
    padDatePart(offsetHours),
    ':',
    padDatePart(offsetRemainderMinutes),
  ].join('')
}

export function isInvalidPaymentDateRange(filters: PaymentHistoryFilterState): boolean {
  if (!filters.dateFrom || !filters.dateTo) return false
  return filters.dateTo < filters.dateFrom
}

export function buildPaymentHistoryQuery(
  filters: PaymentHistoryFilterState,
  pageIndex: number,
  pageSize: number
): PaymentHistoryQuery {
  const normalizedSearchText = filters.searchText.trim()

  return {
    top: pageSize,
    skip: pageIndex * pageSize,
    searchText: normalizedSearchText || undefined,
    planId: filters.planId === 'all' ? undefined : filters.planId,
    status: filters.status === 'all' ? undefined : filters.status,
    dateFrom: filters.dateFrom ? formatLocalDateTimeOffset(filters.dateFrom, false) : undefined,
    dateTo: filters.dateTo ? formatLocalDateTimeOffset(filters.dateTo, true) : undefined,
    needTotalCount: true,
    orderBy: 'createdAt',
    orderType: OrderType.Descending,
  }
}
