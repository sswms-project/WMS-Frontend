import { InboundRequestFormPage } from '@/features/inbound-request/pages'

interface EditInboundRequestRoutePageProps {
  readonly params: Promise<{ inboundRequestId: string }>
}

export default async function EditInboundRequestRoutePage({
  params,
}: EditInboundRequestRoutePageProps) {
  const { inboundRequestId } = await params
  return <InboundRequestFormPage inboundRequestId={inboundRequestId} />
}
