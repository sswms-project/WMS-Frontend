'use client'

import { useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { APP_ROUTES } from '@/routes/app-routes'
import { AuditLogDirectory, type AuditLogFilterValues } from '../components/AuditLogsPage'
import { useAuditLogsQuery } from '../hooks/use-platform-services'
import { auditLogFiltersSchema } from '../schemas/platform-services.schema'
import { buildAuditLogQuery } from '../utils/platform-services-query'
import { canViewAuditLogs } from '../utils/platform-services-permissions'

export default function AuditLogsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serializedParams = searchParams.toString()
  const params = useMemo(() => new URLSearchParams(serializedParams), [serializedParams])
  const queryParams = useMemo(() => buildAuditLogQuery(params), [params])
  const meQuery = useMeQuery()
  const hasAuditLogPermission = canViewAuditLogs(meQuery.data?.permissions ?? [])
  const auditLogsQuery = useAuditLogsQuery(queryParams, meQuery.isSuccess && hasAuditLogPermission)

  useEffect(() => {
    if (meQuery.isSuccess && !hasAuditLogPermission) {
      router.replace(APP_ROUTES.unauthorized)
    }
  }, [hasAuditLogPermission, meQuery.isSuccess, router])
  const filters: AuditLogFilterValues = {
    search: params.get('search') ?? '',
    action: params.get('action') ?? '',
    entityType: params.get('entityType') ?? '',
    entityId: params.get('entityId') ?? '',
    userId: params.get('userId') ?? '',
    dateFrom: params.get('dateFrom') ?? '',
    dateTo: params.get('dateTo') ?? '',
  }
  const hasActiveFilters = [
    'search',
    'action',
    'entityType',
    'entityId',
    'userId',
    'dateFrom',
    'dateTo',
  ].some((key) => Boolean(params.get(key)))

  function applyFilters(values: AuditLogFilterValues) {
    const result = auditLogFiltersSchema.safeParse(values)
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Bộ lọc không hợp lệ.')
      return
    }
    const next = new URLSearchParams()
    for (const [key, value] of Object.entries(result.data)) {
      if (value) next.set(key, value)
    }
    navigate(next)
  }

  if (meQuery.isLoading || (meQuery.isSuccess && !hasAuditLogPermission)) {
    return (
      <div className="flex min-h-48 items-center justify-center" role="status">
        <span className="text-muted-foreground text-sm">Đang kiểm tra quyền truy cập…</span>
      </div>
    )
  }

  if (meQuery.isError) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3" role="alert">
        <p>Không thể kiểm tra quyền truy cập.</p>
        <Button type="button" variant="outline" onClick={() => void meQuery.refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <AuditLogDirectory
      items={auditLogsQuery.data?.items ?? []}
      totalCount={auditLogsQuery.data?.totalCount ?? 0}
      page={queryParams.pageNumber}
      pageSize={queryParams.pageSize}
      filters={filters}
      isLoading={auditLogsQuery.isLoading}
      isFetching={auditLogsQuery.isFetching}
      isError={auditLogsQuery.isError}
      hasActiveFilters={hasActiveFilters}
      onApplyFilters={applyFilters}
      onClearFilters={() => navigate(new URLSearchParams())}
      onPageChange={(page) => {
        const next = new URLSearchParams(params)
        next.set('page', String(page))
        navigate(next)
      }}
      onRetry={() => void auditLogsQuery.refetch()}
    />
  )
}

function navigate(params: URLSearchParams) {
  const query = params.toString()
  window.history.pushState(
    null,
    '',
    query ? `${APP_ROUTES.auditLogs}?${query}` : APP_ROUTES.auditLogs
  )
}
