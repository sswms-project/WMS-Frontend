'use client'

import { useState } from 'react'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAnnouncementHistoryQuery } from '../../hooks/use-admin'
import type { AnnouncementHistoryItem } from '../../types/admin.types'
import { formatAdminDateTime } from '../../utils/platform-admin-format'

const AUDIENCE_LABELS: Record<AnnouncementHistoryItem['audience'], string> = {
  AllActiveTenants: 'Tất cả doanh nghiệp',
  ByPlan: 'Theo gói',
  SpecificTenants: 'Doanh nghiệp cụ thể',
}

function EmailStatus({ item }: { readonly item: AnnouncementHistoryItem }) {
  if (!item.sendEmail) return <span className="text-muted-foreground">Không gửi</span>
  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant="secondary">{item.emailSentCount} đã gửi</Badge>
      {item.emailPendingCount > 0 && <Badge variant="outline">{item.emailPendingCount} chờ</Badge>}
      {item.emailFailedCount > 0 && (
        <Badge variant="destructive">{item.emailFailedCount} lỗi</Badge>
      )}
    </div>
  )
}

export function AnnouncementHistory() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const query = useAnnouncementHistoryQuery({ pageNumber: page, pageSize })
  const items = query.data?.items ?? []

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Lịch sử thông báo</CardTitle>
        <CardDescription>Các thông báo hệ thống đã gửi và trạng thái email.</CardDescription>
      </CardHeader>
      {query.isLoading ? (
        <OperationalLoadingState rows={4} />
      ) : query.isError ? (
        <OperationalErrorState
          title="Không tải được lịch sử thông báo"
          onRetry={() => void query.refetch()}
        />
      ) : items.length === 0 ? (
        <OperationalEmptyState
          title="Chưa có thông báo nào"
          description="Thông báo đã gửi sẽ hiển thị tại đây."
        />
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[48rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead className="text-right">Người nhận</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap tabular-nums">
                    {formatAdminDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-muted-foreground truncate text-xs">{item.message}</p>
                  </TableCell>
                  <TableCell>{AUDIENCE_LABELS[item.audience]}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.recipientCount}</TableCell>
                  <TableCell>
                    <EmailStatus item={item} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <OperationalPagination
        page={page}
        pageSize={pageSize}
        totalCount={query.data?.totalCount ?? 0}
        isPending={query.isFetching}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </Card>
  )
}
