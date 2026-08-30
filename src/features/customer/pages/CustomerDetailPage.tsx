'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { OutboundOrderStatusBadge } from '@/features/outbound/components/OutboundOrdersPage/OutboundOrderStatusBadge'
import { formatOutboundDate } from '@/features/outbound/utils/outbound-format'
import { APP_ROUTES } from '@/routes/app-routes'
import { CustomerFormDialog } from '../components/CustomersPage'
import {
  useCustomerOrderHistoryQuery,
  useCustomerQuery,
  useUpdateCustomerMutation,
} from '../hooks/use-customers'
import { customerSchema, type CustomerFormValues } from '../schemas/customer.schema'

export default function CustomerDetailPage({ customerId }: { readonly customerId: string }) {
  const [page, setPage] = useState(1)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const customerQuery = useCustomerQuery(customerId)
  const historyQuery = useCustomerOrderHistoryQuery(customerId, { pageNumber: page, pageSize: 10 })
  const meQuery = useMeQuery()
  const updateMutation = useUpdateCustomerMutation()
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { customerName: '', phone: '', email: '', address: '' },
  })

  async function update(values: CustomerFormValues) {
    try {
      await updateMutation.mutateAsync({
        customerId,
        request: { ...values, email: values.email || null },
      })
      toast.success('Đã cập nhật khách hàng.')
      setIsEditOpen(false)
    } catch {
      toast.error('Không thể cập nhật khách hàng.')
    }
  }

  if (customerQuery.isLoading) return <OperationalLoadingState />
  if (customerQuery.isError || !customerQuery.data)
    return (
      <OperationalErrorState
        title="Không thể tải khách hàng"
        onRetry={() => void customerQuery.refetch()}
      />
    )
  const customer = customerQuery.data
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b pb-4">
        <div className="flex gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href={APP_ROUTES.customers} aria-label="Quay lại">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <p className="text-primary font-mono text-xs" translate="no">
              {customer.customerCode}
            </p>
            <h1 className="text-xl font-semibold">{customer.customerName}</h1>
            <p className="text-muted-foreground text-sm">
              {customer.phone} · {customer.email ?? 'Chưa có email'} · {customer.address}
            </p>
          </div>
        </div>
        {(meQuery.data?.permissions ?? []).includes('customers:update') ? (
          <Button
            onClick={() => {
              form.reset({
                customerName: customer.customerName,
                phone: customer.phone,
                email: customer.email ?? '',
                address: customer.address,
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
          <h2 className="text-sm font-semibold">Lịch sử đơn xuất</h2>
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
            title="Khách hàng chưa có đơn xuất"
            description="Các đơn xuất mới sẽ xuất hiện tại đây."
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
                      <td className="p-3 font-mono">{order.orderCode}</td>
                      <td className="p-3">{order.warehouseName}</td>
                      <td className="p-3">{order.purpose ?? '—'}</td>
                      <td className="p-3">
                        <OutboundOrderStatusBadge status={order.status} />
                      </td>
                      <td className="p-3">{formatOutboundDate(order.createdAt)}</td>
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
      <CustomerFormDialog
        open={isEditOpen}
        title="Chỉnh sửa khách hàng"
        description="Cập nhật thông tin liên hệ và địa chỉ mặc định."
        form={form}
        isPending={updateMutation.isPending}
        onOpenChange={setIsEditOpen}
        onSubmit={(values) => void update(values)}
      />
    </div>
  )
}
