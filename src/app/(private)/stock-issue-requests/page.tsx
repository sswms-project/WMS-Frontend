import StockIssueRequestPage from '@/features/stock-issue/pages/StockIssueRequestPage'

export default async function StockIssueRequestsRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>
}) {
  const { requestId } = await searchParams
  return <StockIssueRequestPage key={requestId ?? 'list'} initialRequestId={requestId} />
}
