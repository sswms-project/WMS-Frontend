'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatApiError, getApiErrorMessage } from '@/lib/api-error'
import { logger } from '@/lib/logger'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProductSuppliersQuery } from '@/features/product/hooks/use-products'
import { useWarehouseLocationsQuery } from '@/features/warehouse/hooks/use-warehouse'
import {
  useAcceptRebalancingSuggestionMutation,
  useAcceptReplenishmentSuggestionMutation,
  useCreateForecastRunMutation,
  useEvaluateForecastRunMutation,
  useExecuteForecastRunMutation,
  useForecastRunQuery,
  useRejectForecastSuggestionMutation,
} from '../../hooks/use-inventory'
import type {
  ForecastRunStatus,
  ForecastSuggestionStatus,
  InventoryFilterOption,
  RebalancingSuggestion,
  ReplenishmentSuggestion,
} from '../../types/inventory.types'
import { formatInventoryDateOnly, formatInventoryQuantity } from '../../utils/inventory-format'

export function ForecastRunPanel({
  warehouseOptions,
  permissions,
}: {
  readonly warehouseOptions: readonly InventoryFilterOption[]
  readonly permissions: readonly string[]
}) {
  const [warehouseId, setWarehouseId] = useState('')
  const [historicalPeriodDays, setHistoricalPeriodDays] = useState(90)
  const [horizonDays, setHorizonDays] = useState(14)
  const [runId, setRunId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [destinationSlotId, setDestinationSlotId] = useState('')
  const [adjustedQuantity, setAdjustedQuantity] = useState('')
  const [selectedReplenishment, setSelectedReplenishment] =
    useState<ReplenishmentSuggestion | null>(null)
  const [selectedRebalancing, setSelectedRebalancing] = useState<RebalancingSuggestion | null>(null)
  const createMutation = useCreateForecastRunMutation()
  const executeMutation = useExecuteForecastRunMutation()
  const runQuery = useForecastRunQuery(runId)
  const evaluateMutation = useEvaluateForecastRunMutation()
  const acceptReplenishment = useAcceptReplenishmentSuggestionMutation(runId)
  const acceptRebalancing = useAcceptRebalancingSuggestionMutation(runId)
  const rejectSuggestion = useRejectForecastSuggestionMutation(runId)
  const productSuppliers = useProductSuppliersQuery(selectedReplenishment?.productId ?? '')
  const destinationSlots = useWarehouseLocationsQuery(
    selectedRebalancing?.destinationWarehouseId ?? '',
    {
      top: 200,
      skip: 0,
      needTotalCount: true,
      type: 'Slot',
      lifecycleStatus: 'Active',
    }
  )

  async function createAndRun() {
    try {
      const response = await createMutation.mutateAsync({
        warehouseId,
        historicalPeriodDays,
        horizonDays,
      })
      setRunId(response.data)
      await executeMutation.mutateAsync(response.data)
      toast.success('Đã khởi chạy dự báo Linear Regression.')
    } catch (error) {
      logger.error(formatApiError(error))
      toast.error(getApiErrorMessage(error, 'Không thể khởi chạy dự báo.'))
    }
  }

  const run = runQuery.data
  const isPending = createMutation.isPending || executeMutation.isPending
  const adjusted = adjustedQuantity === '' ? null : Number(adjustedQuantity)
  const isAdjustedQuantityValid = adjusted === null || (Number.isFinite(adjusted) && adjusted > 0)
  const canCreateInboundRequest = permissions.includes('inbound-requests:create')
  const canCreateTransfer = permissions.includes('transfers:create')
  const historicalPeriodInvalid = historicalPeriodDays < 1 || historicalPeriodDays > 366
  const horizonInvalid = horizonDays < 1 || horizonDays > 90

  function reject(id: string, suggestionType: 'Replenishment' | 'Rebalancing') {
    rejectSuggestion.mutate(
      { id, suggestionType },
      {
        onSuccess: () => toast.success('Đã từ chối đề xuất.'),
        onError: (error) => {
          logger.error(formatApiError(error))
          toast.error(getApiErrorMessage(error, 'Không thể từ chối đề xuất.'))
        },
      }
    )
  }

  return (
    <section className="bg-card border">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">Phiên dự báo nhu cầu</h2>
        <p className="text-muted-foreground text-xs">Phương pháp: Linear Regression</p>
      </div>
      <FieldGroup className="grid gap-3 p-4 sm:grid-cols-4">
        <Field>
          <FieldLabel htmlFor="forecast-warehouse">Kho</FieldLabel>
          <NativeSelect
            id="forecast-warehouse"
            name="forecastWarehouseId"
            value={warehouseId}
            onChange={(event) => setWarehouseId(event.target.value)}
          >
            <NativeSelectOption value="">Chọn kho</NativeSelectOption>
            {warehouseOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field data-invalid={historicalPeriodInvalid}>
          <FieldLabel htmlFor="forecast-history-days">Số ngày lịch sử</FieldLabel>
          <Input
            id="forecast-history-days"
            name="historicalPeriodDays"
            autoComplete="off"
            type="number"
            min={1}
            max={366}
            value={historicalPeriodDays}
            aria-invalid={historicalPeriodInvalid}
            onChange={(event) => setHistoricalPeriodDays(Number(event.target.value))}
          />
        </Field>
        <Field data-invalid={horizonInvalid}>
          <FieldLabel htmlFor="forecast-horizon-days">Số ngày dự báo</FieldLabel>
          <Input
            id="forecast-horizon-days"
            name="horizonDays"
            autoComplete="off"
            type="number"
            min={1}
            max={90}
            value={horizonDays}
            aria-invalid={horizonInvalid}
            onChange={(event) => setHorizonDays(Number(event.target.value))}
          />
        </Field>
        <Field className="justify-end">
          <FieldLabel className="sr-only">Khởi chạy dự báo</FieldLabel>
          <Button
            type="button"
            disabled={!warehouseId || isPending || historicalPeriodInvalid || horizonInvalid}
            onClick={() => void createAndRun()}
          >
            {isPending ? 'Đang khởi chạy…' : 'Tạo và chạy dự báo'}
          </Button>
        </Field>
      </FieldGroup>
      {runId && runQuery.isLoading ? (
        <div className="flex flex-col gap-2 border-t p-4" aria-label="Đang tải kết quả dự báo">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : null}
      {runId && runQuery.isError ? (
        <div className="border-t p-4">
          <Alert variant="destructive">
            <AlertTitle>Không thể tải kết quả dự báo</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-2">
              <span>Kiểm tra kết nối và thử tải lại phiên dự báo.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void runQuery.refetch()}
              >
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      {run ? (
        <div className="flex flex-col gap-4 border-t p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">
              {run.warehouseName} · {forecastRunStatusLabel(run.status)} ·{' '}
              {formatInventoryDateOnly(run.forecastStartDate)} –{' '}
              {formatInventoryDateOnly(run.forecastEndDate)}
            </p>
            {run.status === 'Completed' ? (
              <Button
                type="button"
                variant="outline"
                disabled={evaluateMutation.isPending}
                onClick={() =>
                  evaluateMutation.mutate(run.id, {
                    onSuccess: () => toast.success('Đã cập nhật độ chính xác dự báo.'),
                    onError: (error) => {
                      logger.error(formatApiError(error))
                      toast.error(getApiErrorMessage(error, 'Không thể đối chiếu độ chính xác.'))
                    },
                  })
                }
              >
                {evaluateMutation.isPending ? 'Đang đối chiếu…' : 'Đối chiếu độ chính xác'}
              </Button>
            ) : null}
          </div>
          {run.status === 'Failed' ? (
            <p className="text-destructive text-sm" role="alert">
              {run.failureReason || 'Phiên dự báo không hoàn tất. Hãy tạo phiên mới.'}
            </p>
          ) : null}
          {run.results.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead className="text-right">Dự báo</TableHead>
                    <TableHead className="text-right">Thực tế</TableHead>
                    <TableHead className="text-right">Độ chính xác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {run.results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>
                        {result.sku} · {result.productName}
                      </TableCell>
                      <TableCell>{formatInventoryDateOnly(result.forecastDate)}</TableCell>
                      <TableCell className="text-right">
                        {formatInventoryQuantity(result.forecastQuantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        {result.actualQuantity === null
                          ? '—'
                          : formatInventoryQuantity(result.actualQuantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        {result.accuracyPercent === null ? '—' : `${result.accuracyPercent}%`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <SuggestionList
              title="Đề xuất bổ sung"
              items={run.replenishmentSuggestions}
              onAccept={(item) => {
                setSelectedRebalancing(null)
                setSelectedReplenishment(item)
                setSupplierId('')
                setAdjustedQuantity('')
              }}
              onReject={(id) => reject(id, 'Replenishment')}
              canAccept={canCreateInboundRequest}
              isRejecting={rejectSuggestion.isPending}
            />
            <SuggestionList
              title="Đề xuất cân bằng kho"
              items={run.rebalancingSuggestions}
              onAccept={(item) => {
                setSelectedReplenishment(null)
                setSelectedRebalancing(item)
                setAdjustedQuantity('')
                setDestinationSlotId('')
              }}
              onReject={(id) => reject(id, 'Rebalancing')}
              canAccept={canCreateTransfer}
              isRejecting={rejectSuggestion.isPending}
            />
          </div>
          {selectedReplenishment ? (
            <FieldGroup className="grid gap-2 border p-3 sm:grid-cols-[1fr_10rem_auto]">
              <Field>
                <FieldLabel htmlFor="replenishment-supplier">Nhà cung cấp</FieldLabel>
                <NativeSelect
                  id="replenishment-supplier"
                  name="replenishmentSupplierId"
                  aria-label="Nhà cung cấp cho đề xuất bổ sung"
                  value={supplierId}
                  disabled={productSuppliers.isLoading || productSuppliers.isError}
                  onChange={(event) => setSupplierId(event.target.value)}
                >
                  <NativeSelectOption value="">
                    {productSuppliers.isLoading ? 'Đang tải…' : 'Chọn nhà cung cấp'}
                  </NativeSelectOption>
                  {(productSuppliers.data ?? [])
                    .filter((supplier) => supplier.supplierStatus === 'Active')
                    .map((supplier) => (
                      <NativeSelectOption key={supplier.id} value={supplier.supplierId}>
                        {supplier.supplierName}
                      </NativeSelectOption>
                    ))}
                </NativeSelect>
              </Field>
              <Field data-invalid={!isAdjustedQuantityValid}>
                <FieldLabel htmlFor="replenishment-quantity">Số lượng</FieldLabel>
                <Input
                  id="replenishment-quantity"
                  name="replenishmentAdjustedQuantity"
                  aria-label="Số lượng bổ sung điều chỉnh"
                  autoComplete="off"
                  type="number"
                  min={0.01}
                  step="0.01"
                  placeholder={`${selectedReplenishment.suggestedQuantity}…`}
                  value={adjustedQuantity}
                  aria-invalid={!isAdjustedQuantityValid}
                  aria-describedby={
                    isAdjustedQuantityValid ? undefined : 'replenishment-adjusted-quantity-error'
                  }
                  onChange={(event) => setAdjustedQuantity(event.target.value)}
                />
              </Field>
              {!isAdjustedQuantityValid ? (
                <p
                  id="replenishment-adjusted-quantity-error"
                  className="text-destructive text-xs sm:col-span-3"
                  role="alert"
                >
                  Số lượng điều chỉnh phải lớn hơn 0.
                </p>
              ) : null}
              <Field className="justify-end">
                <FieldLabel className="sr-only">Tạo yêu cầu nhập kho từ đề xuất</FieldLabel>
                <Button
                  type="button"
                  disabled={
                    !supplierId ||
                    !isAdjustedQuantityValid ||
                    productSuppliers.isLoading ||
                    productSuppliers.isError ||
                    acceptReplenishment.isPending
                  }
                  onClick={() =>
                    acceptReplenishment.mutate(
                      {
                        id: selectedReplenishment.id,
                        request: { supplierId, adjustedQuantity: adjusted },
                      },
                      {
                        onSuccess: () => {
                          toast.success('Đã tạo yêu cầu nhập kho nháp từ đề xuất.')
                          setSelectedReplenishment(null)
                        },
                        onError: (error) => {
                          logger.error(formatApiError(error))
                          toast.error(getApiErrorMessage(error, 'Không thể chấp nhận đề xuất.'))
                        },
                      }
                    )
                  }
                >
                  {acceptReplenishment.isPending ? 'Đang tạo…' : 'Tạo yêu cầu nhập kho'}
                </Button>
              </Field>
              {productSuppliers.isError ? (
                <Alert variant="destructive" className="sm:col-span-3">
                  <AlertTitle>Không thể tải nhà cung cấp</AlertTitle>
                  <AlertDescription className="flex flex-col items-start gap-2">
                    <span>
                      Không thể tạo yêu cầu nhập kho cho tới khi danh sách được tải thành công.
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void productSuppliers.refetch()}
                    >
                      Thử lại
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}
            </FieldGroup>
          ) : null}
          {selectedRebalancing ? (
            <FieldGroup className="grid gap-2 border p-3 sm:grid-cols-[1fr_10rem_auto]">
              <Field>
                <FieldLabel htmlFor="rebalancing-slot">Vị trí kho đích</FieldLabel>
                <NativeSelect
                  id="rebalancing-slot"
                  name="rebalancingDestinationSlotId"
                  aria-label="Vị trí kho đích cho đề xuất cân bằng"
                  value={destinationSlotId}
                  disabled={destinationSlots.isLoading || destinationSlots.isError}
                  onChange={(event) => setDestinationSlotId(event.target.value)}
                >
                  <NativeSelectOption value="">
                    {destinationSlots.isLoading ? 'Đang tải…' : 'Chọn vị trí kho đích'}
                  </NativeSelectOption>
                  {(destinationSlots.data?.items ?? []).map((slot) => (
                    <NativeSelectOption key={slot.id} value={slot.id}>
                      {slot.code}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field data-invalid={!isAdjustedQuantityValid}>
                <FieldLabel htmlFor="rebalancing-quantity">Số lượng</FieldLabel>
                <Input
                  id="rebalancing-quantity"
                  name="rebalancingAdjustedQuantity"
                  aria-label="Số lượng cân bằng điều chỉnh"
                  autoComplete="off"
                  type="number"
                  min={0.01}
                  step="0.01"
                  placeholder={`${selectedRebalancing.suggestedQuantity}…`}
                  value={adjustedQuantity}
                  aria-invalid={!isAdjustedQuantityValid}
                  aria-describedby={
                    isAdjustedQuantityValid ? undefined : 'rebalancing-adjusted-quantity-error'
                  }
                  onChange={(event) => setAdjustedQuantity(event.target.value)}
                />
              </Field>
              {!isAdjustedQuantityValid ? (
                <p
                  id="rebalancing-adjusted-quantity-error"
                  className="text-destructive text-xs sm:col-span-3"
                  role="alert"
                >
                  Số lượng điều chỉnh phải lớn hơn 0.
                </p>
              ) : null}
              <Field className="justify-end">
                <FieldLabel className="sr-only">Tạo điều chuyển từ đề xuất</FieldLabel>
                <Button
                  type="button"
                  disabled={
                    !destinationSlotId ||
                    !isAdjustedQuantityValid ||
                    destinationSlots.isLoading ||
                    destinationSlots.isError ||
                    acceptRebalancing.isPending
                  }
                  onClick={() =>
                    acceptRebalancing.mutate(
                      {
                        id: selectedRebalancing.id,
                        request: { destinationSlotId, adjustedQuantity: adjusted },
                      },
                      {
                        onSuccess: () => {
                          toast.success('Đã tạo phiếu điều chuyển chờ kho nguồn phê duyệt.')
                          setSelectedRebalancing(null)
                        },
                        onError: (error) => {
                          logger.error(formatApiError(error))
                          toast.error(getApiErrorMessage(error, 'Không thể chấp nhận đề xuất.'))
                        },
                      }
                    )
                  }
                >
                  {acceptRebalancing.isPending ? 'Đang tạo…' : 'Tạo điều chuyển'}
                </Button>
              </Field>
              {destinationSlots.isError ? (
                <Alert variant="destructive" className="sm:col-span-3">
                  <AlertTitle>Không thể tải vị trí kho đích</AlertTitle>
                  <AlertDescription className="flex flex-col items-start gap-2">
                    <span>
                      Không thể tạo điều chuyển cho tới khi danh sách được tải thành công.
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void destinationSlots.refetch()}
                    >
                      Thử lại
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}
            </FieldGroup>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function SuggestionList<
  TItem extends {
    id: string
    productName: string
    sku: string
    suggestedQuantity: number
    status: ForecastSuggestionStatus
  },
>({
  title,
  items,
  onAccept,
  onReject,
  canAccept,
  isRejecting,
}: {
  readonly title: string
  readonly items: readonly TItem[]
  readonly onAccept: (item: TItem) => void
  readonly onReject: (id: string) => void
  readonly canAccept: boolean
  readonly isRejecting: boolean
}) {
  return (
    <section className="border p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2 flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-xs">Chưa có đề xuất.</p>
        ) : null}
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 border p-2 text-xs">
            <div>
              <p>
                {item.sku} · {item.productName}
              </p>
              <p className="text-muted-foreground">
                {formatInventoryQuantity(item.suggestedQuantity)} ·{' '}
                {forecastSuggestionStatusLabel(item.status)}
              </p>
            </div>
            {item.status === 'New' ? (
              <div className="flex gap-1">
                {canAccept ? (
                  <Button type="button" size="sm" onClick={() => onAccept(item)}>
                    Chấp nhận
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isRejecting}
                  onClick={() => onReject(item.id)}
                >
                  {isRejecting ? 'Đang xử lý…' : 'Từ chối'}
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function forecastRunStatusLabel(status: ForecastRunStatus): string {
  if (status === 'Pending') return 'Chờ chạy'
  if (status === 'Running') return 'Đang chạy'
  if (status === 'Completed') return 'Hoàn tất'
  return 'Không thành công'
}

function forecastSuggestionStatusLabel(status: ForecastSuggestionStatus): string {
  if (status === 'New') return 'Mới'
  if (status === 'Accepted') return 'Đã chấp nhận'
  if (status === 'Rejected') return 'Đã từ chối'
  return 'Đã hết hiệu lực'
}
