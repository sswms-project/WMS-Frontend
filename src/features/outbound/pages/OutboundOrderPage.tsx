'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { formatApiError, getApiErrorMessage } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { useInventoryQuery } from '@/features/inventory/hooks/use-inventory'
import { useWarehouseLocationsQuery } from '@/features/warehouse/hooks/use-warehouse'
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
  useRemovePickDetailMutation,
} from '../hooks/use-outbound-orders'
import {
  issueStockSchema,
  recordReturnSchema,
  type IssueStockFormValues,
  type RecordReturnFormValues,
} from '../schemas/outbound.schema'
import type { OutboundOrderStatus, OutboundOrderSummary } from '../types/outbound.types'

const PAGE_SIZE = 10

function toIssueStockLines(order: OutboundOrderSummary): IssueStockFormValues['lines'] {
  return order.items.map((item) => ({
    outboundOrderItemId: item.id,
    productId: item.productId,
    productName: item.productName,
    sku: item.sku,
    remainingQuantity: Math.max(0, item.quantity - item.pickedQuantity),
    inventoryStockId: '',
    availableQuantity: 0,
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
  const removePickDetailMutation = useRemovePickDetailMutation()

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
              inventoryStockId: line.inventoryStockId,
              pickedQuantity: line.pickedQuantity,
            })),
        },
      })
      toast.success('Đã ghi nhận lấy hàng và giữ tồn kho cho đơn xuất.')
      handleIssueStockDialogOpenChange(false)
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể ghi nhận lấy hàng. Vui lòng thử lại.'))
    }
  }

  const allowableByPickDetail = useMemo(() => {
    if (!returningOrder) return {}
    return Object.fromEntries(
      returningOrder.items.flatMap((item) =>
        item.pickDetails.map((detail) => [detail.id, Math.max(0, detail.returnableQuantity)])
      )
    )
  }, [returningOrder])

  function openReturn(order: OutboundOrderSummary) {
    setReturningOrder(order)
    setReturnSlotSearch('')
    returnForm.reset({
      reason: '',
      lines: order.items.flatMap((item) =>
        item.pickDetails
          .filter((detail) => detail.issuedAt && detail.returnableQuantity > 0)
          .map((detail) => ({
            outboundPickDetailId: detail.id,
            productName: item.productName,
            lotNumber: detail.lotNumber,
            returnableQuantity: detail.returnableQuantity,
            quantity: 0,
            condition: 'Good',
            restockSlotId: '',
          }))
      ),
    })
  }

  async function handleRecordReturn(values: RecordReturnFormValues) {
    if (!returningOrder) return
    const invalid = values.lines.some((line) => line.quantity > line.returnableQuantity)
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
              outboundPickDetailId: line.outboundPickDetailId,
              quantity: line.quantity,
              condition: line.condition,
              restockSlotId: line.condition === 'Scrap' ? null : line.restockSlotId,
            })),
        },
      })
      toast.success('Đã tạo yêu cầu hoàn hàng.')
      setReturningOrder(null)
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể ghi nhận hoàn hàng.'))
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
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
        isRemovingPick={removePickDetailMutation.isPending}
        onRemovePickDetail={(pickDetailId) => {
          const orderId = orderDetailQuery.data?.id
          if (!orderId) return
          void removePickDetailMutation
            .mutateAsync({ outboundOrderId: orderId, pickDetailId })
            .then(() => toast.success('Đã bỏ dòng phân bổ chưa xuất kho.'))
            .catch((error) => {
              logger.error(formatApiError(error))
              toast.error(getApiErrorMessage(error, 'Không thể bỏ dòng phân bổ.'))
            })
        }}
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
          .filter((item) => item.availableQuantity > 0 && item.qualityStatus === 'Good')
          .map((item) => ({
            productId: item.productId,
            inventoryStockId: item.id,
            slotId: item.slotId,
            lotNumber: item.lotNumber,
            qualityStatus: item.qualityStatus,
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
        allowableByPickDetail={allowableByPickDetail}
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
