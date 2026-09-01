'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { useSyncPaymentStatusQuery } from '../hooks/use-subscription'

export function PaymentResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const orderCode = searchParams.get('orderCode')
  const cancelParam = searchParams.get('cancel') === 'true'
  const statusParam = searchParams.get('status')

  const syncQuery = useSyncPaymentStatusQuery(orderCode)

  const dbStatus = syncQuery.data
  const urlCancelled = cancelParam || statusParam === 'CANCELLED'
  const isPaid = dbStatus === 'Completed'
  const isCancelled = dbStatus === 'Failed' || (dbStatus !== 'Completed' && urlCancelled)
  const isError = syncQuery.isError && !isPaid && !isCancelled
  const isLoading =
    !isPaid &&
    !isCancelled &&
    !isError &&
    (syncQuery.isLoading || syncQuery.isFetching || dbStatus === 'Pending')

  useEffect(() => {
    if (isPaid) {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })
    }
  }, [isPaid, queryClient])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      {isPaid && (
        <>
          <CheckCircle className="h-16 w-16 text-green-500" aria-hidden="true" />
          <div className="text-center">
            <h1 className="text-foreground text-2xl font-semibold">Thanh toán thành công</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Gói dịch vụ đã được cập nhật. Mã đơn: {orderCode}
            </p>
          </div>
          <Button onClick={() => router.push('/subscription')}>Xem gói hiện tại</Button>
        </>
      )}

      {isCancelled && (
        <>
          <XCircle className="text-destructive h-16 w-16" aria-hidden="true" />
          <div className="text-center">
            <h1 className="text-foreground text-2xl font-semibold">Đã hủy thanh toán</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Giao dịch bị hủy. Gói dịch vụ không thay đổi.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/subscription')}>
            Quay lại gói dịch vụ
          </Button>
        </>
      )}

      {isError && (
        <>
          <AlertCircle className="text-destructive h-16 w-16" aria-hidden="true" />
          <div className="text-center">
            <h1 className="text-foreground text-2xl font-semibold">
              Không thể xác nhận thanh toán
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Không thể kết nối máy chủ. Vui lòng kiểm tra lại trong lịch sử thanh toán.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/subscription')}>
            Quay lại gói dịch vụ
          </Button>
        </>
      )}

      {isLoading && (
        <Loader className="text-muted-foreground h-16 w-16 animate-spin" aria-hidden="true" />
      )}

      {!isLoading && !isPaid && !isCancelled && !isError && (
        <>
          <Loader className="text-muted-foreground h-16 w-16 animate-spin" aria-hidden="true" />
          <div className="text-center">
            <h1 className="text-foreground text-2xl font-semibold">Đang xử lý thanh toán</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Giao dịch đang được xác nhận. Vui lòng chờ trong giây lát...
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/subscription')}>
            Quay lại gói dịch vụ
          </Button>
        </>
      )}
    </div>
  )
}
