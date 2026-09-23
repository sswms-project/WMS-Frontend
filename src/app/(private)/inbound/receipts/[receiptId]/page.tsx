import { GoodsReceiptDetailPage } from '@/features/inbound/pages'

interface GoodsReceiptDetailRoutePageProps {
  readonly params: Promise<{ receiptId: string }>
}

export default async function GoodsReceiptDetailRoutePage({
  params,
}: GoodsReceiptDetailRoutePageProps) {
  const { receiptId } = await params
  return <GoodsReceiptDetailPage receiptId={receiptId} />
}
