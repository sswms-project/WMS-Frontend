'use client'

import { useState } from 'react'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import type { AuditLogItem } from '../../types/platform-services.types'
import { AuditLogDetailSheet } from './AuditLogDetailSheet'
import { AuditLogFilters } from './AuditLogFilters'
import { AuditLogList } from './AuditLogList'
import type { AuditLogDirectoryProps } from './types'

export function AuditLogDirectory(props: AuditLogDirectoryProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null)
  return (
    <section
      className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3"
      aria-labelledby="audit-title"
    >
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
      <OperationalListPanel aria-label="Nhật ký hệ thống">
        <div className="shrink-0 border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Nhật ký hệ thống</h3>
        </div>
        <div data-slot="operational-list-body" className="min-h-0">
          <AuditLogList
            items={props.items}
            isLoading={props.isLoading}
            isFetching={props.isFetching}
            isError={props.isError}
            hasActiveFilters={props.hasActiveFilters}
            onView={setSelectedLog}
            onRetry={props.onRetry}
          />
        </div>
        {!props.isLoading && !props.isError && props.totalCount > 0 ? (
          <OperationalPagination
            page={props.page}
            pageSize={props.pageSize}
            totalCount={props.totalCount}
            isPending={props.isFetching}
            onPageChange={props.onPageChange}
            onPageSizeChange={props.onPageSizeChange}
          />
        ) : null}
      </OperationalListPanel>
      <AuditLogDetailSheet
        log={selectedLog}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null)
        }}
      />
    </section>
  )
}
