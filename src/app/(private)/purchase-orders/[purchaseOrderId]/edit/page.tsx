import { PurchaseOrderFormPage } from '@/features/purchase-order/pages'

interface EditPurchaseOrderRoutePageProps {
  readonly params: Promise<{ purchaseOrderId: string }>
}

export default async function EditPurchaseOrderRoutePage({
  params,
}: EditPurchaseOrderRoutePageProps) {
  const { purchaseOrderId } = await params
  return <PurchaseOrderFormPage purchaseOrderId={purchaseOrderId} />
}
