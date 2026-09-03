'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AuditLogItem } from '../../types/platform-services.types'
import { PaginationControls } from '../shared/PaginationControls'
import { AuditLogDetailSheet } from './AuditLogDetailSheet'
import { AuditLogFilters } from './AuditLogFilters'
import { AuditLogList } from './AuditLogList'
import type { AuditLogDirectoryProps } from './types'

export function AuditLogDirectory(props: AuditLogDirectoryProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null)
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3" aria-labelledby="audit-title">
      <div>
        <h2 id="audit-title" className="text-xl font-semibold">
          Audit Log
        </h2>
        <p className="text-muted-foreground text-sm">
          Tra cứu lịch sử các hành động nghiệp vụ quan trọng.
        </p>
      </div>
      <AuditLogFilters
        filters={props.filters}
        onApply={props.onApplyFilters}
        onClear={props.onClearFilters}
      />
      <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm">Nhật ký hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
          <AuditLogList
            items={props.items}
            isLoading={props.isLoading}
            isFetching={props.isFetching}
            isError={props.isError}
            hasActiveFilters={props.hasActiveFilters}
            onView={setSelectedLog}
            onRetry={props.onRetry}
          />
        </CardContent>
        {!props.isLoading && !props.isError && props.totalCount > 0 ? (
          <PaginationControls
            page={props.page}
            pageSize={props.pageSize}
            totalCount={props.totalCount}
            isFetching={props.isFetching}
            onPageChange={props.onPageChange}
          />
        ) : null}
      </Card>
      <AuditLogDetailSheet
        log={selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null)
        }}
      />
    </section>
  )
}
