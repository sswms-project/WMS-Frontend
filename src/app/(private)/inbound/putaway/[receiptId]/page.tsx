import { InboundPutawayDetailPage } from '@/features/inbound/pages'

interface InboundPutawayDetailRoutePageProps {
  readonly params: Promise<{ receiptId: string }>
}

export default async function InboundPutawayDetailRoutePage({
  params,
}: InboundPutawayDetailRoutePageProps) {
  const { receiptId } = await params
  return <InboundPutawayDetailPage receiptId={receiptId} />
}
