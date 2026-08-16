import type { ReactNode } from 'react'
import { WarehouseWorkspaceLayout } from '@/features/warehouse/components/WarehouseWorkspace'

interface WarehouseRouteLayoutProps {
  readonly children: ReactNode
  readonly params: Promise<{ warehouseId: string }>
}

export default async function WarehouseRouteLayout({
  children,
  params,
}: WarehouseRouteLayoutProps) {
  const { warehouseId } = await params

  return <WarehouseWorkspaceLayout warehouseId={warehouseId}>{children}</WarehouseWorkspaceLayout>
}
