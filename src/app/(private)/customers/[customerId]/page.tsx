import CustomerDetailPage from '@/features/customer/pages/CustomerDetailPage'

export default async function CustomerDetailRoutePage({
  params,
}: PageProps<'/customers/[customerId]'>) {
  const { customerId } = await params
  return <CustomerDetailPage customerId={customerId} />
}
