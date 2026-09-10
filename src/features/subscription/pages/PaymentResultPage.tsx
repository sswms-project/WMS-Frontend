'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, CheckCircle, Loader, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProcessVNPayReturnMutation } from '../hooks/use-subscription'

export function PaymentResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const processedRef = useRef(false)

  const vnpayReturnMutation = useProcessVNPayReturnMutation()

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    if (Object.keys(params).length === 0) return

    vnpayReturnMutation.mutate(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const status = vnpayReturnMutation.data
  const isPaid = status === 'Completed'
  const isCancelled = status === 'Failed'
  const isError = vnpayReturnMutation.isError || searchParams.toString() === ''
  const isProcessing = vnpayReturnMutation.isPending && !isError

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      {isPaid && (
        <>
          <CheckCircle className="h-16 w-16 text-green-500" aria-hidden="true" />
          <div className="text-center">
            <h1 className="text-foreground text-2xl font-semibold">Thanh toán thành công</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Gói dịch vụ đã được cập nhật. Mã giao dịch: {searchParams.get('vnp_TxnRef')}
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

      {isError && !isPaid && !isCancelled && (
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

      {isProcessing && (
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
