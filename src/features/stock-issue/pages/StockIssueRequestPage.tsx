'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { formatApiError, getApiErrorMessage } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useWarehousesQuery } from '@/features/warehouse/hooks/use-warehouse'
import { useInventoryReservationsQuery } from '@/features/inventory/hooks/use-inventory'
import { useWarehouseLocationsQuery } from '@/features/warehouse/hooks/use-warehouse'
import {
  RecordStockPickingDialog,
  StockIssueRequestDetailSheet,
  StockIssueRequestDirectory,
  CreateGoodsReturnRequestDialog,
} from '../components/StockIssueRequestsPage'
import {
  useStockRecipientOptionsQuery,
  useRecordStockPickingMutation,
  useStockIssueRequestQuery,
  useStockIssueRequestsQuery,
  useCreateGoodsReturnRequestMutation,
  useAuthorizeStockDispatchMutation,
  useConfirmStockDispatchMutation,
  useRemovePickDetailMutation,
  useReleaseStockIssueRequestMutation,
} from '../hooks/use-stock-issue-requests'
import {
  recordStockPickingSchema,
  createGoodsReturnRequestSchema,
  type RecordStockPickingFormValues,
  type CreateGoodsReturnRequestFormValues,
} from '../schemas/stock-issue.schema'
import type { StockIssueRequestStatus, StockIssueRequestSummary } from '../types/stock-issue.types'

const PAGE_SIZE = 10

function toRecordStockPickingLines(
  order: StockIssueRequestSummary
): RecordStockPickingFormValues['lines'] {
  return order.items.map((item) => ({
    stockIssueRequestItemId: item.id,
    productId: item.productId,
    productName: item.productName,
    sku: item.sku,
    remainingQuantity: Math.max(0, item.quantity - item.pickedQuantity),
    inventoryStockId: '',
    availableQuantity: 0,
    pickedQuantity: 0,
  }))
}

export default function StockIssueRequestPage() {
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<StockIssueRequestStatus | ''>('')
  const [warehouseId, setWarehouseId] = useState('')
  const [stockRecipientId, setStockRecipientId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [inspectedOrder, setInspectedOrder] = useState<StockIssueRequestSummary | null>(null)
  const [issuingOrder, setIssuingOrder] = useState<StockIssueRequestSummary | null>(null)
  const [returningOrder, setGoodsReturnRequestingOrder] = useState<StockIssueRequestSummary | null>(
    null
  )
  const [dispatchingOrder, setDispatchingOrder] = useState<StockIssueRequestSummary | null>(null)
  const [authorizingOrder, setAuthorizingOrder] = useState<StockIssueRequestSummary | null>(null)
  const [releasingOrder, setReleasingOrder] = useState<StockIssueRequestSummary | null>(null)
  const [issueInventorySearch, setIssueInventorySearch] = useState('')
  const [returnSlotSearch, setGoodsReturnRequestSlotSearch] = useState('')

  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const debouncedGoodsReturnRequestSlotSearch = useDebouncedValue(returnSlotSearch, 350)

  const meQuery = useMeQuery()
  const ordersQuery = useStockIssueRequestsQuery({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    ...(status ? { status } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(debouncedSearchText.trim() ? { searchTerm: debouncedSearchText.trim() } : {}),
    ...(stockRecipientId ? { stockRecipientId } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  })
  const stockRecipientOptionsQuery = useStockRecipientOptionsQuery({ pageNumber: 1, pageSize: 200 })
  const orderDetailQuery = useStockIssueRequestQuery(inspectedOrder?.id ?? null)
  const reservationQuery = useInventoryReservationsQuery(
    {
      pageNumber: 1,
      pageSize: 100,
      status: 'Active',
      ...(issuingOrder ? { warehouseId: issuingOrder.warehouseId } : {}),
    },
    Boolean(issuingOrder)
  )
  const returnSlotsQuery = useWarehouseLocationsQuery(returningOrder?.warehouseId ?? '', {
    top: 200,
    skip: 0,
    needTotalCount: true,
    type: 'Slot',
    lifecycleStatus: 'Active',
    ...(debouncedGoodsReturnRequestSlotSearch.trim()
      ? { searchText: debouncedGoodsReturnRequestSlotSearch.trim() }
      : {}),
  })
  const warehousesQuery = useWarehousesQuery({
    top: 100,
    skip: 0,
    needTotalCount: true,
    isActive: true,
  })

  const recordStockPickingMutation = useRecordStockPickingMutation()
  const createGoodsReturnRequestMutation = useCreateGoodsReturnRequestMutation()
  const confirmDispatchMutation = useConfirmStockDispatchMutation()
  const authorizeDispatchMutation = useAuthorizeStockDispatchMutation()
  const removePickDetailMutation = useRemovePickDetailMutation()
  const releaseForPickingMutation = useReleaseStockIssueRequestMutation()

  const recordStockPickingForm = useForm<RecordStockPickingFormValues>({
    resolver: zodResolver(recordStockPickingSchema),
    defaultValues: { lines: [] },
  })
  const returnForm = useForm<CreateGoodsReturnRequestFormValues>({
    resolver: zodResolver(createGoodsReturnRequestSchema),
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

  function handleRecordStockPickingDialogOpenChange(open: boolean) {
    if (!open) {
      setIssuingOrder(null)
      recordStockPickingForm.reset({ lines: [] })
      setIssueInventorySearch('')
    }
  }

  function handleOpenRecordStockPicking(order: StockIssueRequestSummary) {
    recordStockPickingForm.reset({ lines: toRecordStockPickingLines(order) })
    setIssueInventorySearch('')
    setIssuingOrder(order)
  }

  async function handleRecordStockPicking(values: RecordStockPickingFormValues) {
    if (!issuingOrder) return

    try {
      await recordStockPickingMutation.mutateAsync({
        stockIssueRequestId: issuingOrder.id,
        request: {
          items: values.lines
            .filter((line) => line.pickedQuantity > 0)
            .map((line) => ({
              stockIssueRequestItemId: line.stockIssueRequestItemId,
              inventoryStockId: line.inventoryStockId,
              pickedQuantity: line.pickedQuantity,
            })),
        },
      })
      toast.success('Đã ghi nhận lấy hàng và giữ tồn kho cho yêu cầu xuất kho.')
      handleRecordStockPickingDialogOpenChange(false)
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

  function openGoodsReturnRequest(order: StockIssueRequestSummary) {
    setGoodsReturnRequestingOrder(order)
    setGoodsReturnRequestSlotSearch('')
    returnForm.reset({
      reason: '',
      lines: order.items.flatMap((item) =>
        item.pickDetails
          .filter((detail) => detail.issuedAt && detail.returnableQuantity > 0)
          .map((detail) => ({
            stockIssuePickDetailId: detail.id,
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

  async function handleCreateGoodsReturnRequest(values: CreateGoodsReturnRequestFormValues) {
    if (!returningOrder) return
    const invalid = values.lines.some((line) => line.quantity > line.returnableQuantity)
    if (invalid) {
      toast.error('Số lượng trả vượt quá số lượng cho phép.')
      return
    }
    try {
      await createGoodsReturnRequestMutation.mutateAsync({
        stockIssueRequestId: returningOrder.id,
        request: {
          reason: values.reason,
          items: values.lines
            .filter((line) => line.quantity > 0)
            .map((line) => ({
              stockIssuePickDetailId: line.stockIssuePickDetailId,
              quantity: line.quantity,
              condition: line.condition,
              restockSlotId: line.condition === 'Scrap' ? null : line.restockSlotId,
            })),
        },
      })
      toast.success('Đã tạo yêu cầu trả hàng.')
      setGoodsReturnRequestingOrder(null)
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể tạo yêu cầu trả hàng.'))
    }
  }

  async function handleConfirmDispatch() {
    if (!dispatchingOrder) return
    try {
      await confirmDispatchMutation.mutateAsync(dispatchingOrder.id)
      toast.success('Đã xác nhận hàng rời kho và ghi giảm tồn kho.')
      setDispatchingOrder(null)
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể xác nhận xuất kho.'))
    }
  }

  async function handleAuthorizeDispatch() {
    if (!authorizingOrder) return
    try {
      await authorizeDispatchMutation.mutateAsync(authorizingOrder.id)
      toast.success('Đã cho phép nhân viên xác nhận hàng rời kho.')
      setAuthorizingOrder(null)
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể cho phép xuất kho.'))
    }
  }

  async function handleReleaseForPicking() {
    if (!releasingOrder) return
    try {
      if (!releasingOrder.version) {
        toast.error('Phiếu xuất chưa có phiên bản. Vui lòng tải lại.')
        return
      }
      await releaseForPickingMutation.mutateAsync({
        stockIssueRequestId: releasingOrder.id,
        commandId: crypto.randomUUID(),
        expectedVersion: releasingOrder.version,
      })
      toast.success('Đã duyệt phiếu và giữ tồn kho cho bước lấy hàng.')
      setReleasingOrder(null)
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể duyệt và giữ hàng.'))
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <StockIssueRequestDirectory
        items={items}
        totalCount={ordersQuery.data?.totalCount ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        searchText={searchText}
        status={status}
        warehouseId={warehouseId}
        stockRecipientId={stockRecipientId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        stockRecipientOptions={(stockRecipientOptionsQuery.data?.items ?? []).map(
          (stockRecipient) => ({
            id: stockRecipient.id,
            name: `${stockRecipient.recipientCode} · ${stockRecipient.recipientName}`,
          })
        )}
        warehouseOptions={warehouseOptions}
        permissions={meQuery.data?.permissions ?? []}
        isLoading={ordersQuery.isLoading}
        isFetching={ordersQuery.isFetching}
        isError={ordersQuery.isError}
        onSearchChange={(value) => updateFilter(setSearchText, value)}
        onStatusChange={(value) => updateFilter(setStatus, value)}
        onWarehouseChange={(value) => updateFilter(setWarehouseId, value)}
        onStockRecipientChange={(value) => updateFilter(setStockRecipientId, value)}
        onDateFromChange={(value) => updateFilter(setDateFrom, value)}
        onDateToChange={(value) => updateFilter(setDateTo, value)}
        onPageChange={setPage}
        onRetry={() => void ordersQuery.refetch()}
        onInspect={setInspectedOrder}
        onReleaseForPicking={setReleasingOrder}
        onRecordStockPicking={handleOpenRecordStockPicking}
        onAuthorizeDispatch={setAuthorizingOrder}
        onConfirmDispatch={setDispatchingOrder}
        onCreateGoodsReturnRequest={openGoodsReturnRequest}
      />
      <StockIssueRequestDetailSheet
        order={orderDetailQuery.data ?? null}
        isLoading={orderDetailQuery.isLoading}
        isError={orderDetailQuery.isError}
        onRetry={() => void orderDetailQuery.refetch()}
        isRemovingPick={removePickDetailMutation.isPending}
        onRemovePickDetail={(pickDetailId) => {
          const orderId = orderDetailQuery.data?.id
          if (!orderId) return
          void removePickDetailMutation
            .mutateAsync({ stockIssueRequestId: orderId, pickDetailId })
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
      <RecordStockPickingDialog
        order={issuingOrder}
        form={recordStockPickingForm}
        isPending={recordStockPickingMutation.isPending}
        onOpenChange={handleRecordStockPickingDialogOpenChange}
        onSubmit={handleRecordStockPicking}
        inventoryOptions={(reservationQuery.data?.items ?? [])
          .filter(
            (item) =>
              item.referenceType === 'StockIssueRequestLine' &&
              issuingOrder?.items.some((line) => line.id === item.referenceId)
          )
          .map((item) => ({
            productId: item.productId,
            inventoryStockId: item.inventoryStockId,
            slotId: item.slotId,
            lotNumber: item.lotNumber,
            qualityStatus: item.qualityStatus,
            label: item.slotCode,
            availableQuantity: item.reservedQuantity,
          }))}
        inventorySearch={issueInventorySearch}
        onInventorySearchChange={setIssueInventorySearch}
      />
      <AlertDialog
        open={Boolean(releasingOrder)}
        onOpenChange={(open) => {
          if (!open && !releaseForPickingMutation.isPending) setReleasingOrder(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Send aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Duyệt và giữ hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Hệ thống sẽ phân bổ tồn đủ điều kiện và giữ số lượng cho phiếu trước khi nhân viên lấy
              hàng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={releaseForPickingMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={releaseForPickingMutation.isPending}
              onClick={() => void handleReleaseForPicking()}
            >
              {releaseForPickingMutation.isPending ? 'Đang xử lý…' : 'Duyệt và giữ hàng'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CreateGoodsReturnRequestDialog
        order={returningOrder}
        form={returnForm}
        isPending={createGoodsReturnRequestMutation.isPending}
        slotOptions={(returnSlotsQuery.data?.items ?? []).map((slot) => ({
          id: slot.id,
          label: slot.code,
        }))}
        allowableByPickDetail={allowableByPickDetail}
        slotSearch={returnSlotSearch}
        onSlotSearchChange={setGoodsReturnRequestSlotSearch}
        onOpenChange={(open) => {
          if (!open) {
            setGoodsReturnRequestingOrder(null)
            setGoodsReturnRequestSlotSearch('')
          }
        }}
        onSubmit={handleCreateGoodsReturnRequest}
      />
      <AlertDialog
        open={Boolean(authorizingOrder)}
        onOpenChange={(open) => {
          if (!open && !authorizeDispatchMutation.isPending) setAuthorizingOrder(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Send aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Cho phép xuất kho?</AlertDialogTitle>
            <AlertDialogDescription>
              Hàng đã được lấy đủ và đang được giữ tại các vị trí đã chọn. Sau khi bạn cho phép,
              nhân viên kho mới có thể quét và xác nhận hàng rời kho.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={authorizeDispatchMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={authorizeDispatchMutation.isPending}
              onClick={() => void handleAuthorizeDispatch()}
            >
              {authorizeDispatchMutation.isPending ? 'Đang xử lý…' : 'Cho phép xuất'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={Boolean(dispatchingOrder)}
        onOpenChange={(open) => {
          if (!open && !confirmDispatchMutation.isPending) setDispatchingOrder(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Send aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xác nhận hàng đã rời kho?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ ghi giảm tồn kho thật, sử dụng lượng hàng đã giữ và chuyển yêu cầu
              xuất sang trạng thái Đã xuất kho.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmDispatchMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmDispatchMutation.isPending}
              onClick={() => void handleConfirmDispatch()}
            >
              {confirmDispatchMutation.isPending ? 'Đang xác nhận…' : 'Xác nhận xuất kho'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
