'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import {
  IssueStockDialog,
  OutboundOrderDetailSheet,
  OutboundOrderDirectory,
} from '../components/OutboundOrdersPage'
import { useIssueStockMutation, useOutboundOrdersQuery } from '../hooks/use-outbound-orders'
import { issueStockSchema, type IssueStockFormValues } from '../schemas/outbound.schema'
import type { OutboundOrderStatus, OutboundOrderSummary } from '../types/outbound.types'

const PAGE_SIZE = 10

function resolveErrorMessage(error: unknown, fallback: string): string {
  return typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
    ? error.message
    : fallback
}

function toIssueStockLines(order: OutboundOrderSummary): IssueStockFormValues['lines'] {
  return order.items.map((item) => ({
    outboundOrderItemId: item.id,
    productName: item.productName,
    sku: item.sku,
    orderedQuantity: item.quantity,
    sourceSlotId: item.sourceSlotId ?? '',
    pickedQuantity: 0,
  }))
}

export default function OutboundOrderPage() {
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<OutboundOrderStatus | ''>('')
  const [warehouseId, setWarehouseId] = useState('')
  const [page, setPage] = useState(1)
  const [inspectedOrder, setInspectedOrder] = useState<OutboundOrderSummary | null>(null)
  const [issuingOrder, setIssuingOrder] = useState<OutboundOrderSummary | null>(null)

  const debouncedSearchText = useDebouncedValue(searchText, 350)

  const meQuery = useMeQuery()
  const ordersQuery = useOutboundOrdersQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(status ? { status } : {}),
    ...(warehouseId ? { warehouseId } : {}),
  })
  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })

  const issueStockMutation = useIssueStockMutation()

  const issueStockForm = useForm<IssueStockFormValues>({
    resolver: zodResolver(issueStockSchema),
    defaultValues: { lines: [] },
  })

  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data?.items ?? []).map((warehouse) => ({
        id: warehouse.id,
        name: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
      })),
    [warehousesQuery.data?.items]
  )

  // OutboundOrderListQuery has no searchTerm, so the keyword narrows the current page locally.
  const items = useMemo(() => {
    const allItems = ordersQuery.data?.items ?? []
    const keyword = debouncedSearchText.trim().toLowerCase()
    if (!keyword) return allItems

    return allItems.filter((order) =>
      [order.orderCode, order.customerName, order.warehouseName].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    )
  }, [ordersQuery.data?.items, debouncedSearchText])

  function updateFilter<TValue>(setValue: (value: TValue) => void, value: TValue) {
    setValue(value)
    setPage(1)
  }

  function handleIssueStockDialogOpenChange(open: boolean) {
    if (!open) {
      setIssuingOrder(null)
      issueStockForm.reset({ lines: [] })
    }
  }

  function handleOpenIssueStock(order: OutboundOrderSummary) {
    issueStockForm.reset({ lines: toIssueStockLines(order) })
    setIssuingOrder(order)
  }

  async function handleIssueStock(values: IssueStockFormValues) {
    if (!issuingOrder) return

    try {
      await issueStockMutation.mutateAsync({
        outboundOrderId: issuingOrder.id,
        request: {
          items: values.lines
            .filter((line) => line.pickedQuantity > 0)
            .map((line) => ({
              outboundOrderItemId: line.outboundOrderItemId,
              sourceSlotId: line.sourceSlotId,
              pickedQuantity: line.pickedQuantity,
            })),
        },
      })
      toast.success('Đã xuất kho, tồn kho được cập nhật.')
      handleIssueStockDialogOpenChange(false)
    } catch (error) {
      toast.error(resolveErrorMessage(error, 'Không thể xuất kho. Vui lòng thử lại.'))
    }
  }

  return (
    <>
      <OutboundOrderDirectory
        items={items}
        totalCount={ordersQuery.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        status={status}
        warehouseId={warehouseId}
        warehouseOptions={warehouseOptions}
        permissions={meQuery.data?.permissions ?? []}
        isLoading={ordersQuery.isLoading}
        isFetching={ordersQuery.isFetching}
        isError={ordersQuery.isError}
        onSearchChange={(value) => updateFilter(setSearchText, value)}
        onStatusChange={(value) => updateFilter(setStatus, value)}
        onWarehouseChange={(value) => updateFilter(setWarehouseId, value)}
        onPageChange={setPage}
        onRetry={() => void ordersQuery.refetch()}
        onInspect={setInspectedOrder}
        onIssueStock={handleOpenIssueStock}
      />
      <OutboundOrderDetailSheet
        order={inspectedOrder}
        onOpenChange={(open) => {
          if (!open) setInspectedOrder(null)
        }}
      />
      <IssueStockDialog
        order={issuingOrder}
        form={issueStockForm}
        isPending={issueStockMutation.isPending}
        onOpenChange={handleIssueStockDialogOpenChange}
        onSubmit={handleIssueStock}
      />
    </>
  )
}
