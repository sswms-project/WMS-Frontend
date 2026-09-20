import StockRecipientDetailPage from '@/features/stock-recipient/pages/StockRecipientDetailPage'

export default async function StockRecipientDetailRoutePage({
  params,
}: PageProps<'/stock-recipients/[stockRecipientId]'>) {
  const { stockRecipientId } = await params
  return <StockRecipientDetailPage stockRecipientId={stockRecipientId} />
}
