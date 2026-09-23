'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Route } from 'next'
import { ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { P } from '@/config/permissionCodes'
import { Button } from '@/components/ui/button'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { StockIssueRequestStatusBadge } from '@/features/stock-issue/components/StockIssueRequestsPage/StockIssueRequestStatusBadge'
import { formatStockIssueDate } from '@/features/stock-issue/utils/stock-issue-format'
import { APP_ROUTES } from '@/routes/app-routes'
import { StockRecipientFormDialog } from '../components/StockRecipientsPage'
import {
  useStockRecipientIssueHistoryQuery,
  useStockRecipientQuery,
  useUpdateStockRecipientMutation,
} from '../hooks/use-stock-recipients'
import {
  stockRecipientSchema,
  type StockRecipientFormValues,
} from '../schemas/stock-recipient.schema'

export default function StockRecipientDetailPage({
  stockRecipientId,
}: {
  readonly stockRecipientId: string
}) {
  const [page, setPage] = useState(1)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const stockRecipientQuery = useStockRecipientQuery(stockRecipientId)
  const historyQuery = useStockRecipientIssueHistoryQuery(stockRecipientId, {
    pageNumber: page,
    pageSize: 10,
  })
  const meQuery = useMeQuery()
  const updateMutation = useUpdateStockRecipientMutation()
  const form = useForm<StockRecipientFormValues>({
    resolver: zodResolver(stockRecipientSchema),
    defaultValues: { recipientName: '', phone: '', email: '', address: '' },
  })

  async function update(values: StockRecipientFormValues) {
    try {
      await updateMutation.mutateAsync({
        stockRecipientId,
        request: { ...values, email: values.email || null },
      })
      toast.success('Đã cập nhật đơn vị nhận hàng.')
      setIsEditOpen(false)
    } catch {
      toast.error('Không thể cập nhật đơn vị nhận hàng.')
    }
  }

  if (stockRecipientQuery.isLoading) return <OperationalLoadingState />
  if (stockRecipientQuery.isError || !stockRecipientQuery.data)
    return (
      <OperationalErrorState
        title="Không thể tải đơn vị nhận hàng"
        onRetry={() => void stockRecipientQuery.refetch()}
      />
    )
  const stockRecipient = stockRecipientQuery.data
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b pb-4">
        <div className="flex gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href={APP_ROUTES.stockRecipients as Route} aria-label="Quay lại">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <p className="text-primary font-mono text-xs" translate="no">
              {stockRecipient.recipientCode}
            </p>
            <h1 className="text-xl font-semibold">{stockRecipient.recipientName}</h1>
            <p className="text-muted-foreground text-sm">
              {stockRecipient.phone} · {stockRecipient.email ?? 'Chưa có email'} ·{' '}
              {stockRecipient.address}
            </p>
          </div>
        </div>
        {(meQuery.data?.permissions ?? []).includes(P.STOCK_RECIPIENTS_UPDATE) ? (
          <Button
            onClick={() => {
              form.reset({
                recipientName: stockRecipient.recipientName,
                phone: stockRecipient.phone,
                email: stockRecipient.email ?? '',
                address: stockRecipient.address,
              })
              setIsEditOpen(true)
            }}
          >
            <Pencil />
            Chỉnh sửa
          </Button>
        ) : null}
      </header>
      <section className="flex min-h-0 flex-1 flex-col border">
        <div className="border-b p-3">
          <h2 className="text-sm font-semibold">Lịch sử yêu cầu xuất kho</h2>
          <p className="text-muted-foreground text-xs">{historyQuery.data?.totalCount ?? 0} đơn</p>
        </div>
        {historyQuery.isLoading ? (
          <OperationalLoadingState />
        ) : historyQuery.isError ? (
          <OperationalErrorState
            title="Không thể tải lịch sử đơn"
            onRetry={() => void historyQuery.refetch()}
          />
        ) : (historyQuery.data?.items.length ?? 0) === 0 ? (
          <OperationalEmptyState
            title="Đơn vị nhận hàng chưa có yêu cầu xuất kho"
            description="Các yêu cầu xuất kho mới sẽ xuất hiện tại đây."
          />
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-card sticky top-0">
                  <tr className="border-b text-left">
                    <th className="p-3">Mã đơn</th>
                    <th className="p-3">Kho</th>
                    <th className="p-3">Mục đích</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {historyQuery.data?.items.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="p-3 font-mono">{order.stockIssueRequestCode}</td>
                      <td className="p-3">{order.warehouseName}</td>
                      <td className="p-3">{order.purpose ?? '—'}</td>
                      <td className="p-3">
                        <StockIssueRequestStatusBadge status={order.status} />
                      </td>
                      <td className="p-3">{formatStockIssueDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <OperationalPagination
              page={page}
              pageSize={10}
              totalCount={historyQuery.data?.totalCount ?? 0}
              isPending={historyQuery.isFetching}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
      <StockRecipientFormDialog
        open={isEditOpen}
        title="Chỉnh sửa đơn vị nhận hàng"
        description="Cập nhật thông tin liên hệ và địa chỉ mặc định."
        form={form}
        isPending={updateMutation.isPending}
        onOpenChange={setIsEditOpen}
        onSubmit={(values) => void update(values)}
      />
    </div>
  )
}
