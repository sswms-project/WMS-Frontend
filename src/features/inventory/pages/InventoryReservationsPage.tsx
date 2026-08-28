'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useProductOptionsQuery } from '@/features/purchase-order/hooks/use-purchase-orders'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import {
  InventoryReservationDirectory,
  ReleaseReservationDialog,
} from '../components/InventoryReservationsPage'
import {
  useInventoryReservationsQuery,
  useReleaseReservationMutation,
} from '../hooks/use-inventory'
import {
  releaseReservationSchema,
  type ReleaseReservationFormValues,
} from '../schemas/release-reservation.schema'
import type { InventoryBalance } from '../types/inventory.types'
import { buildInventoryReservationQuery } from '../utils/inventory-reservation-query'

export default function InventoryReservationsPage() {
  const [warehouseId, setWarehouseId] = useState('')
  const [productId, setProductId] = useState('')
  const [selectedReservation, setSelectedReservation] = useState<InventoryBalance | null>(null)
  const meQuery = useMeQuery()
  const releaseMutation = useReleaseReservationMutation()
  const releaseForm = useForm<ReleaseReservationFormValues>({
    resolver: zodResolver(releaseReservationSchema),
    defaultValues: { quantity: 1 },
  })
  const params = useMemo(
    () => buildInventoryReservationQuery(warehouseId, productId),
    [productId, warehouseId]
  )
  const reservationsQuery = useInventoryReservationsQuery(params)
  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })
  const productsQuery = useProductOptionsQuery({ pageNumber: 1, pageSize: 100, status: 'Active' })
  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data?.items ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
      })),
    [warehousesQuery.data?.items]
  )
  const productOptions = useMemo(
    () =>
      (productsQuery.data?.items ?? []).map((product) => ({
        value: product.id,
        label: `${product.sku} · ${product.productName}`,
      })),
    [productsQuery.data?.items]
  )

  function handleDialogOpenChange(open: boolean) {
    if (!open) {
      setSelectedReservation(null)
      releaseForm.reset({ quantity: 1 })
    }
  }

  async function handleRelease(values: ReleaseReservationFormValues) {
    if (!selectedReservation) return
    if (values.quantity > selectedReservation.reservedQuantity) {
      releaseForm.setError('quantity', {
        message: `Chỉ có ${selectedReservation.reservedQuantity} đơn vị đang giữ.`,
      })
      return
    }
    try {
      await releaseMutation.mutateAsync({
        inventoryBalanceId: selectedReservation.id,
        quantity: values.quantity,
      })
      toast.success('Đã giải phóng tồn kho thành công.')
      handleDialogOpenChange(false)
    } catch (error) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Không thể giải phóng tồn kho. Vui lòng thử lại.'
      toast.error(message)
    }
  }

  return (
    <>
      <InventoryReservationDirectory
        permissions={meQuery.data?.permissions ?? []}
        items={reservationsQuery.data ?? []}
        warehouseId={warehouseId}
        productId={productId}
        warehouseOptions={warehouseOptions}
        productOptions={productOptions}
        isLoading={reservationsQuery.isLoading}
        isFetching={reservationsQuery.isFetching}
        isError={reservationsQuery.isError}
        areFiltersLoading={warehousesQuery.isLoading || productsQuery.isLoading}
        areFiltersError={warehousesQuery.isError || productsQuery.isError}
        activeFilterCount={Number(Boolean(warehouseId)) + Number(Boolean(productId))}
        canRelease={meQuery.data?.permissions.includes('inventory:reserve') ?? false}
        onWarehouseChange={setWarehouseId}
        onProductChange={setProductId}
        onResetFilters={() => {
          setWarehouseId('')
          setProductId('')
        }}
        onRetryFilters={() =>
          void Promise.all([warehousesQuery.refetch(), productsQuery.refetch()])
        }
        onRetry={() => void reservationsQuery.refetch()}
        onRelease={setSelectedReservation}
      />
      <ReleaseReservationDialog
        item={selectedReservation}
        form={releaseForm}
        isPending={releaseMutation.isPending}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleRelease}
      />
    </>
  )
}
