'use client'

import { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth.store'
import { InvoicePrintView } from '../components/SubscriptionPage'
import { useInvoiceDataQuery } from '../hooks/use-subscription'
import { isCompletedPayment } from '../utils/format-subscription'

interface InvoicePrintPageProps {
  readonly paymentId: string
}

export function InvoicePrintPage({ paymentId }: InvoicePrintPageProps) {
  const user = useAuthStore((state) => state.user)
  const invoiceQuery = useInvoiceDataQuery(paymentId, Boolean(paymentId))
  const isInvoiceAvailable = Boolean(
    invoiceQuery.data && isCompletedPayment(invoiceQuery.data.status)
  )

  useEffect(() => {
    if (!isInvoiceAvailable) return

    const printTimer = window.setTimeout(() => window.print(), 250)
    return () => window.clearTimeout(printTimer)
  }, [isInvoiceAvailable])

  if (invoiceQuery.isLoading) {
    return (
      <main className="mx-auto max-w-3xl space-y-3 p-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </main>
    )
  }

  if (invoiceQuery.isError || !isInvoiceAvailable || !invoiceQuery.data) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Alert variant="destructive">
          <AlertTitle>Payment receipt unavailable</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Vui lòng thử lại trước khi in.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => invoiceQuery.refetch()}
            >
              Tải lại
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <InvoicePrintView
      invoice={invoiceQuery.data}
      customer={{ displayName: user?.fullName ?? user?.email, email: user?.email }}
    />
  )
}
