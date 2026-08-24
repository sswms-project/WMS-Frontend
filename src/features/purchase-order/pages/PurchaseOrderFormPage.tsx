'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { logger } from '@/lib/logger'
import { APP_ROUTES } from '@/routes/app-routes'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { PurchaseOrderForm, type LookupOption } from '../components/PurchaseOrderFormPage'
import {
  useCreatePurchaseOrderMutation,
  useProductOptionsQuery,
  usePurchaseOrderQuery,
  useSubmitPurchaseOrderMutation,
  useSupplierOptionsQuery,
  useUpdatePurchaseOrderMutation,
} from '../hooks/use-purchase-orders'
import { purchaseOrderSchema, type PurchaseOrderFormValues } from '../schemas/purchase-order.schema'
import type { SavePurchaseOrderRequest } from '../types/purchase-order.types'

const EMPTY_LINE = { productId: '', quantity: 1, unitPrice: null }
const LOOKUP_PAGE_SIZE = 20

function mergeLookupOptions(
  options: readonly LookupOption[],
  fallbackOptions: readonly LookupOption[]
): LookupOption[] {
  return Array.from(
    new Map([...fallbackOptions, ...options].map((option) => [option.value, option])).values()
  )
}

export default function PurchaseOrderFormPage({
  purchaseOrderId,
}: {
  readonly purchaseOrderId?: string
}) {
  const router = useRouter()
  const hydratedPurchaseOrderId = useRef<string | null>(null)
  const createdPurchaseOrderId = useRef<string | null>(null)
  const [warehouseSearchText, setWarehouseSearchText] = useState('')
  const [supplierSearchText, setSupplierSearchText] = useState('')
  const [productSearchText, setProductSearchText] = useState('')
  const debouncedWarehouseSearch = useDebouncedValue(warehouseSearchText.trim(), 300)
  const debouncedSupplierSearch = useDebouncedValue(supplierSearchText.trim(), 300)
  const debouncedProductSearch = useDebouncedValue(productSearchText.trim(), 300)
  const isEditing = Boolean(purchaseOrderId)
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: { warehouseId: '', supplierId: '', expectedDate: '', lines: [EMPTY_LINE] },
  })
  const fieldArray = useFieldArray({ control: form.control, name: 'lines' })
  const detailQuery = usePurchaseOrderQuery(purchaseOrderId ?? '')
  const warehousesQuery = useWarehousesQuery({
    top: LOOKUP_PAGE_SIZE,
    skip: 0,
    needTotalCount: true,
    isActive: true,
    ...(debouncedWarehouseSearch ? { searchText: debouncedWarehouseSearch } : {}),
  })
  const productsQuery = useProductOptionsQuery({
    pageNumber: 1,
    pageSize: LOOKUP_PAGE_SIZE,
    status: 'Active',
    ...(debouncedProductSearch ? { searchTerm: debouncedProductSearch } : {}),
  })
  const suppliersQuery = useSupplierOptionsQuery({
    pageNumber: 1,
    pageSize: LOOKUP_PAGE_SIZE,
    status: 'Active',
    ...(debouncedSupplierSearch ? { searchTerm: debouncedSupplierSearch } : {}),
  })
  const createMutation = useCreatePurchaseOrderMutation()
  const updateMutation = useUpdatePurchaseOrderMutation()
  const submitMutation = useSubmitPurchaseOrderMutation()

  useEffect(() => {
    const detail = detailQuery.data
    if (!detail || hydratedPurchaseOrderId.current === detail.id) return
    form.reset({
      warehouseId: detail.warehouseId ?? '',
      supplierId: detail.supplierId,
      expectedDate: detail.expectedDate?.slice(0, 10) ?? '',
      lines: detail.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    })
    hydratedPurchaseOrderId.current = detail.id
  }, [detailQuery.data, form])

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!form.formState.isDirty) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [form.formState.isDirty])

  function toRequest(values: PurchaseOrderFormValues): SavePurchaseOrderRequest {
    return {
      warehouseId: values.warehouseId,
      supplierId: values.supplierId,
      expectedDate: values.expectedDate
        ? new Date(`${values.expectedDate}T00:00:00`).toISOString()
        : null,
      lines: values.lines,
    }
  }

  async function save(values: PurchaseOrderFormValues, shouldSubmit: boolean) {
    let savedId = purchaseOrderId ?? createdPurchaseOrderId.current
    try {
      const request = toRequest(values)
      if (savedId) {
        await updateMutation.mutateAsync({ purchaseOrderId: savedId, request })
      } else {
        const response = await createMutation.mutateAsync(request)
        savedId = response.data
        createdPurchaseOrderId.current = savedId
      }
      if (shouldSubmit && savedId) {
        try {
          await submitMutation.mutateAsync(savedId)
        } catch (error) {
          logger.error(error)
          toast.error(
            'Đơn mua đã được lưu nháp nhưng chưa gửi duyệt. Bạn có thể thử lại từ trang chi tiết.'
          )
          router.push(APP_ROUTES.purchaseOrderDetail(savedId) as Route)
          return
        }
      }
      form.reset(values)
      toast.success(shouldSubmit ? 'Đã lưu và gửi đơn mua để duyệt.' : 'Đã lưu bản nháp đơn mua.')
      if (savedId) router.push(APP_ROUTES.purchaseOrderDetail(savedId) as Route)
    } catch (error) {
      logger.error(error)
      toast.error('Không thể lưu đơn mua. Vui lòng kiểm tra dữ liệu và thử lại.')
    }
  }

  function handleCancel() {
    if (
      form.formState.isDirty &&
      !window.confirm('Dữ liệu chưa lưu sẽ bị mất. Bạn vẫn muốn rời trang?')
    )
      return
    router.push(
      (purchaseOrderId
        ? APP_ROUTES.purchaseOrderDetail(purchaseOrderId)
        : APP_ROUTES.purchaseOrders) as Route
    )
  }

  const isLoading =
    warehousesQuery.isLoading ||
    productsQuery.isLoading ||
    suppliersQuery.isLoading ||
    (isEditing && detailQuery.isLoading)
  const isError =
    warehousesQuery.isError ||
    productsQuery.isError ||
    suppliersQuery.isError ||
    (isEditing && detailQuery.isError)
  const isPending = createMutation.isPending || updateMutation.isPending || submitMutation.isPending
  const detail = detailQuery.data
  const warehouseOptions = mergeLookupOptions(
    (warehousesQuery.data?.items ?? []).map((warehouse) => ({
      value: warehouse.id,
      label: `${warehouse.warehouseCode} - ${warehouse.warehouseName}`,
    })),
    detail?.warehouseId
      ? [
          {
            value: detail.warehouseId,
            label: `${detail.warehouseCode ?? ''} - ${detail.warehouseName ?? 'Kho hiện tại'}`,
          },
        ]
      : []
  )
  const supplierOptions = mergeLookupOptions(
    (suppliersQuery.data?.items ?? []).map((supplier) => ({
      value: supplier.id,
      label: `${supplier.supplierName} · ${supplier.phone}`,
    })),
    detail ? [{ value: detail.supplierId, label: detail.supplierName }] : []
  )
  const productOptions = mergeLookupOptions(
    (productsQuery.data?.items ?? []).map((product) => ({
      value: product.id,
      label: `${product.sku} - ${product.productName}`,
    })),
    detail?.lines.map((line) => ({
      value: line.productId,
      label: `${line.productSKU} - ${line.productName}`,
    })) ?? []
  )

  if (isLoading) return <OperationalLoadingState rows={8} />
  if (isError) {
    return (
      <OperationalErrorState
        title="Không thể chuẩn bị biểu mẫu đơn mua"
        onRetry={() => {
          void warehousesQuery.refetch()
          void productsQuery.refetch()
          void suppliersQuery.refetch()
          if (isEditing) void detailQuery.refetch()
        }}
      />
    )
  }

  return (
    <PurchaseOrderForm
      title={
        isEditing ? `Chỉnh sửa ${detailQuery.data?.poNumber ?? 'đơn mua'}` : 'Tạo đơn mua hàng'
      }
      description="Chọn kho, nhà cung cấp và các sản phẩm cần nhập."
      form={form}
      fields={fieldArray.fields}
      warehouseOptions={warehouseOptions}
      supplierOptions={supplierOptions}
      productOptions={productOptions}
      isWarehouseSearchLoading={warehousesQuery.isFetching}
      isSupplierSearchLoading={suppliersQuery.isFetching}
      isProductSearchLoading={productsQuery.isFetching}
      isPending={isPending}
      onAddLine={() => fieldArray.append(EMPTY_LINE)}
      onRemoveLine={fieldArray.remove}
      onCancel={handleCancel}
      onSaveDraft={() => void form.handleSubmit((values) => save(values, false))()}
      onSaveAndSubmit={() => void form.handleSubmit((values) => save(values, true))()}
      onWarehouseSearchChange={setWarehouseSearchText}
      onSupplierSearchChange={setSupplierSearchText}
      onProductSearchChange={setProductSearchText}
    />
  )
}
