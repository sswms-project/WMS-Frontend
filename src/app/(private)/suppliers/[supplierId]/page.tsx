import { SupplierDetailPage } from '@/features/supplier/pages'

interface SupplierDetailRoutePageProps {
  readonly params: Promise<{ supplierId: string }>
}

export default async function SupplierDetailRoutePage({ params }: SupplierDetailRoutePageProps) {
  const { supplierId } = await params
  return <SupplierDetailPage supplierId={supplierId} />
}
