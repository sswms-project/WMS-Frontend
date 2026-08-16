import { InvoicePrintPage } from '@/features/subscription/pages'

interface SubscriptionInvoicePrintRoutePageProps {
  readonly params: Promise<{
    readonly paymentId: string
  }>
}

export default async function SubscriptionInvoicePrintRoutePage({
  params,
}: SubscriptionInvoicePrintRoutePageProps) {
  const { paymentId } = await params
  return <InvoicePrintPage paymentId={paymentId} />
}
