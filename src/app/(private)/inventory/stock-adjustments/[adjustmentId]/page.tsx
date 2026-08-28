import { StockAdjustmentDetailPage } from '@/features/cycle-count/pages'

export default async function Page({
  params,
}: {
  readonly params: Promise<{ adjustmentId: string }>
}) {
  const { adjustmentId } = await params
  return <StockAdjustmentDetailPage adjustmentId={adjustmentId} />
}
