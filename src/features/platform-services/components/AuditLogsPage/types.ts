import type { AuditLogItem } from '../../types/platform-services.types'

export interface AuditLogFilterValues {
  readonly search: string
  readonly action: string
  readonly entityType: string
  readonly entityId: string
  readonly userId: string
  readonly dateFrom: string
  readonly dateTo: string
}

export interface AuditLogDirectoryProps {
  readonly items: AuditLogItem[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly filters: AuditLogFilterValues
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly hasActiveFilters: boolean
  readonly onApplyFilters: (filters: AuditLogFilterValues) => void
  readonly onClearFilters: () => void
  readonly onPageChange: (page: number) => void
  readonly onRetry: () => void
}
