import { InboundRequestDetailPage } from '@/features/inbound-request/pages'

interface InboundRequestDetailRoutePageProps {
  readonly params: Promise<{ inboundRequestId: string }>
}

export default async function InboundRequestDetailRoutePage({
  params,
}: InboundRequestDetailRoutePageProps) {
  const { inboundRequestId } = await params
  return <InboundRequestDetailPage inboundRequestId={inboundRequestId} />
}
