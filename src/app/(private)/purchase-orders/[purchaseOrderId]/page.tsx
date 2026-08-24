import { PurchaseOrderDetailPage } from '@/features/purchase-order/pages'

interface PurchaseOrderDetailRoutePageProps {
  readonly params: Promise<{ purchaseOrderId: string }>
}

export default async function PurchaseOrderDetailRoutePage({
  params,
}: PurchaseOrderDetailRoutePageProps) {
  const { purchaseOrderId } = await params
  return <PurchaseOrderDetailPage purchaseOrderId={purchaseOrderId} />
}
