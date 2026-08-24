import { InboundReceiptDetailPage } from '@/features/inbound/pages'

interface InboundReceiptDetailRoutePageProps {
  readonly params: Promise<{ receiptId: string }>
}

export default async function InboundReceiptDetailRoutePage({
  params,
}: InboundReceiptDetailRoutePageProps) {
  const { receiptId } = await params
  return <InboundReceiptDetailPage receiptId={receiptId} />
}
