'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { useInventoryQuery } from '@/features/inventory/hooks/use-inventory'
import { useWarehouseLocationsQuery } from '@/features/warehouse/hooks/use-warehouse'
import { OutboundWorkspaceNavigation } from '@/components/operations/OutboundWorkspaceNavigation'
import {
  IssueStockDialog,
  OutboundOrderDetailSheet,
  OutboundOrderDirectory,
  RecordReturnDialog,
} from '../components/OutboundOrdersPage'
import {
  useCustomerOptionsQuery,
  useIssueStockMutation,
  useOutboundOrderQuery,
  useOutboundOrdersQuery,
  useRecordReturnMutation,
} from '../hooks/use-outbound-orders'
import {
  issueStockSchema,
  recordReturnSchema,
  type IssueStockFormValues,
  type RecordReturnFormValues,
} from '../schemas/outbound.schema'
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
    productId: item.productId,
    productName: item.productName,
    sku: item.sku,
    remainingQuantity: Math.max(0, item.quantity - item.pickedQuantity),
    sourceSlotId: item.sourceSlotId ?? '',
    pickedQuantity: 0,
  }))
}

export default function OutboundOrderPage() {
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<OutboundOrderStatus | ''>('')
  const [warehouseId, setWarehouseId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [inspectedOrder, setInspectedOrder] = useState<OutboundOrderSummary | null>(null)
  const [issuingOrder, setIssuingOrder] = useState<OutboundOrderSummary | null>(null)
  const [returningOrder, setReturningOrder] = useState<OutboundOrderSummary | null>(null)
  const [issueInventorySearch, setIssueInventorySearch] = useState('')
  const [returnSlotSearch, setReturnSlotSearch] = useState('')

  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const debouncedIssueInventorySearch = useDebouncedValue(issueInventorySearch, 350)
  const debouncedReturnSlotSearch = useDebouncedValue(returnSlotSearch, 350)

  const meQuery = useMeQuery()
  const ordersQuery = useOutboundOrdersQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(status ? { status } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(debouncedSearchText.trim() ? { searchTerm: debouncedSearchText.trim() } : {}),
    ...(customerId ? { customerId } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  })
  const customerOptionsQuery = useCustomerOptionsQuery({ pageNumber: 1, pageSize: 200 })
  const orderDetailQuery = useOutboundOrderQuery(inspectedOrder?.id ?? null)
  const inventoryQuery = useInventoryQuery(
    {
      pageNumber: 1,
      pageSize: 200,
      ...(issuingOrder ? { warehouseId: issuingOrder.warehouseId } : {}),
      ...(debouncedIssueInventorySearch.trim()
        ? { searchTerm: debouncedIssueInventorySearch.trim() }
        : {}),
    },
    Boolean(issuingOrder)
  )
  const returnSlotsQuery = useWarehouseLocationsQuery(returningOrder?.warehouseId ?? '', {
    top: 200,
    skip: 0,
    needTotalCount: true,
    type: 'Slot',
    lifecycleStatus: 'Active',
    ...(debouncedReturnSlotSearch.trim() ? { searchText: debouncedReturnSlotSearch.trim() } : {}),
  })
  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })

  const issueStockMutation = useIssueStockMutation()
  const recordReturnMutation = useRecordReturnMutation()

  const issueStockForm = useForm<IssueStockFormValues>({
    resolver: zodResolver(issueStockSchema),
    defaultValues: { lines: [] },
  })
  const returnForm = useForm<RecordReturnFormValues>({
    resolver: zodResolver(recordReturnSchema),
    defaultValues: { reason: '', lines: [] },
  })

  const warehouseOptions = useMemo(
    () =>
      (warehousesQuery.data?.items ?? []).map((warehouse) => ({
        id: warehouse.id,
        name: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
      })),
    [warehousesQuery.data?.items]
  )

  const items = ordersQuery.data?.items ?? []

  function updateFilter<TValue>(setValue: (value: TValue) => void, value: TValue) {
    setValue(value)
    setPage(1)
  }

  function handleIssueStockDialogOpenChange(open: boolean) {
    if (!open) {
      setIssuingOrder(null)
      issueStockForm.reset({ lines: [] })
      setIssueInventorySearch('')
    }
  }

  function handleOpenIssueStock(order: OutboundOrderSummary) {
    issueStockForm.reset({ lines: toIssueStockLines(order) })
    setIssueInventorySearch('')
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

  const allowableByProduct = useMemo(() => {
    if (!returningOrder) return {}
    return Object.fromEntries(
      returningOrder.items.map((item) => [item.productId, Math.max(0, item.returnableQuantity)])
    )
  }, [returningOrder])

  function openReturn(order: OutboundOrderSummary) {
    setReturningOrder(order)
    setReturnSlotSearch('')
    returnForm.reset({
      reason: '',
      lines: order.items
        .filter((item) => item.pickedQuantity > 0)
        .map((item) => ({
          productId: item.productId,
          quantity: 0,
          condition: 'Good',
          restockSlotId: '',
        })),
    })
  }

  async function handleRecordReturn(values: RecordReturnFormValues) {
    if (!returningOrder) return
    const invalid = values.lines.some(
      (line) => line.quantity > (allowableByProduct[line.productId] ?? 0)
    )
    if (invalid) {
      toast.error('Số lượng hoàn vượt quá số lượng cho phép.')
      return
    }
    try {
      await recordReturnMutation.mutateAsync({
        outboundOrderId: returningOrder.id,
        request: {
          reason: values.reason,
          items: values.lines
            .filter((line) => line.quantity > 0)
            .map((line) => ({
              ...line,
              restockSlotId: line.condition === 'Good' ? line.restockSlotId : null,
            })),
        },
      })
      toast.success('Đã tạo yêu cầu hoàn hàng.')
      setReturningOrder(null)
    } catch (error) {
      toast.error(resolveErrorMessage(error, 'Không thể ghi nhận hoàn hàng.'))
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <OutboundWorkspaceNavigation
        currentView="orders"
        permissions={meQuery.data?.permissions ?? []}
      />
      <OutboundOrderDirectory
        items={items}
        totalCount={ordersQuery.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        status={status}
        warehouseId={warehouseId}
        customerId={customerId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        customerOptions={(customerOptionsQuery.data?.items ?? []).map((customer) => ({
          id: customer.id,
          name: `${customer.customerCode} · ${customer.customerName}`,
        }))}
        warehouseOptions={warehouseOptions}
        permissions={meQuery.data?.permissions ?? []}
        isLoading={ordersQuery.isLoading}
        isFetching={ordersQuery.isFetching}
        isError={ordersQuery.isError}
        onSearchChange={(value) => updateFilter(setSearchText, value)}
        onStatusChange={(value) => updateFilter(setStatus, value)}
        onWarehouseChange={(value) => updateFilter(setWarehouseId, value)}
        onCustomerChange={(value) => updateFilter(setCustomerId, value)}
        onDateFromChange={(value) => updateFilter(setDateFrom, value)}
        onDateToChange={(value) => updateFilter(setDateTo, value)}
        onPageChange={setPage}
        onRetry={() => void ordersQuery.refetch()}
        onInspect={setInspectedOrder}
        onIssueStock={handleOpenIssueStock}
        onRecordReturn={openReturn}
      />
      <OutboundOrderDetailSheet
        order={orderDetailQuery.data ?? null}
        isLoading={orderDetailQuery.isLoading}
        isError={orderDetailQuery.isError}
        onRetry={() => void orderDetailQuery.refetch()}
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
        inventoryOptions={(inventoryQuery.data?.items ?? [])
          .filter((item) => item.availableQuantity > 0)
          .map((item) => ({
            productId: item.productId,
            slotId: item.slotId,
            label: item.slotCode,
            availableQuantity: item.availableQuantity,
          }))}
        inventorySearch={issueInventorySearch}
        onInventorySearchChange={setIssueInventorySearch}
      />
      <RecordReturnDialog
        order={returningOrder}
        form={returnForm}
        isPending={recordReturnMutation.isPending}
        slotOptions={(returnSlotsQuery.data?.items ?? []).map((slot) => ({
          id: slot.id,
          label: slot.code,
        }))}
        allowableByProduct={allowableByProduct}
        slotSearch={returnSlotSearch}
        onSlotSearchChange={setReturnSlotSearch}
        onOpenChange={(open) => {
          if (!open) {
            setReturningOrder(null)
            setReturnSlotSearch('')
          }
        }}
        onSubmit={handleRecordReturn}
      />
    </div>
  )
}
