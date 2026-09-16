'use client'

import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { WarehouseResponse } from '@/types/warehouse'
import type { ProductLot, ProductLotStatus } from '../../types/product.types'

interface ProductLotsPanelProps {
  readonly lots: readonly ProductLot[]
  readonly warehouses: readonly WarehouseResponse[]
  readonly warehouseId: string
  readonly status: ProductLotStatus | ''
  readonly onlyAvailable: boolean
  readonly expiresOnOrBefore: string
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isUpdating: boolean
  readonly canManage: boolean
  readonly onWarehouseChange: (value: string) => void
  readonly onStatusChange: (value: ProductLotStatus | '') => void
  readonly onOnlyAvailableChange: (value: boolean) => void
  readonly onExpiryChange: (value: string) => void
  readonly onRetry: () => void
  readonly onStatusUpdate: (lot: ProductLot, status: 'Active' | 'Blocked') => void
}

function lotStatusLabel(status: ProductLotStatus) {
  if (status === 'Active') return 'Đang hoạt động'
  if (status === 'Blocked') return 'Đang khóa'
  return 'Đã hết hạn'
}

function parseLotStatus(value: string): ProductLotStatus | '' {
  return value === 'Active' || value === 'Expired' || value === 'Blocked' ? value : ''
}

const lotDateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' })
const lotQuantityFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 })

function formatLotDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : lotDateFormatter.format(date)
}

export function ProductLotsPanel(props: ProductLotsPanelProps) {
  const [lotToBlock, setLotToBlock] = useState<ProductLot | null>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Lô sản phẩm</CardTitle>
          <CardDescription>
            Lô được tạo khi nhận hàng thực tế; ngày sản xuất và hạn sử dụng có thể để trống.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FieldGroup className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Field>
              <FieldLabel htmlFor="lot-warehouse-filter">Kho</FieldLabel>
              <NativeSelect
                id="lot-warehouse-filter"
                value={props.warehouseId}
                onChange={(event) => props.onWarehouseChange(event.target.value)}
              >
                <NativeSelectOption value="">Tất cả kho</NativeSelectOption>
                {props.warehouses.map((warehouse) => (
                  <NativeSelectOption key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouseName}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="lot-status-filter">Trạng thái</FieldLabel>
              <NativeSelect
                id="lot-status-filter"
                value={props.status}
                onChange={(event) => props.onStatusChange(parseLotStatus(event.target.value))}
              >
                <NativeSelectOption value="">Tất cả</NativeSelectOption>
                <NativeSelectOption value="Active">Đang hoạt động</NativeSelectOption>
                <NativeSelectOption value="Blocked">Đang khóa</NativeSelectOption>
                <NativeSelectOption value="Expired">Đã hết hạn</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="lot-expiry-filter">Hết hạn trước ngày</FieldLabel>
              <Input
                id="lot-expiry-filter"
                type="date"
                value={props.expiresOnOrBefore}
                onChange={(event) => props.onExpiryChange(event.target.value)}
              />
            </Field>
            <Field orientation="horizontal" className="items-end pb-2">
              <Checkbox
                id="lot-available-filter"
                checked={props.onlyAvailable}
                onCheckedChange={(checked) => props.onOnlyAvailableChange(checked === true)}
              />
              <FieldLabel htmlFor="lot-available-filter">Chỉ còn khả dụng</FieldLabel>
            </Field>
          </FieldGroup>

          {props.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : props.isError ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 border text-center">
              <p className="text-sm font-medium">Không thể tải danh sách lô</p>
              <Button type="button" variant="outline" size="sm" onClick={props.onRetry}>
                <RefreshCw data-icon="inline-start" aria-hidden="true" />
                Thử lại
              </Button>
            </div>
          ) : props.lots.length === 0 ? (
            <div className="text-muted-foreground flex min-h-40 items-center justify-center border text-sm">
              Chưa có lô phù hợp.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Số lô</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày sản xuất</TableHead>
                  <TableHead>Hạn sử dụng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Tồn</TableHead>
                  <TableHead className="text-right">Đang giữ</TableHead>
                  <TableHead className="text-right">Khả dụng</TableHead>
                  {props.canManage ? <TableHead className="text-right">Thao tác</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {props.lots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-mono">{lot.lotNumber}</TableCell>
                    <TableCell>{lot.supplierName ?? '—'}</TableCell>
                    <TableCell>{formatLotDate(lot.manufacturedDate)}</TableCell>
                    <TableCell>{formatLotDate(lot.expiryDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lotStatusLabel(lot.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {lotQuantityFormatter.format(lot.quantityOnHand)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {lotQuantityFormatter.format(lot.reservedQuantity)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {lotQuantityFormatter.format(lot.availableQuantity)}
                    </TableCell>
                    {props.canManage ? (
                      <TableCell className="text-right">
                        {lot.status !== 'Expired' ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={props.isUpdating}
                            onClick={() => {
                              if (lot.status === 'Blocked') props.onStatusUpdate(lot, 'Active')
                              else setLotToBlock(lot)
                            }}
                          >
                            {lot.status === 'Blocked' ? 'Mở khóa' : 'Khóa lô'}
                          </Button>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(lotToBlock)}
        onOpenChange={(open) => {
          if (!open && !props.isUpdating) setLotToBlock(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khóa lô {lotToBlock?.lotNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              Lô bị khóa sẽ không thể được chọn cho các nghiệp vụ nhập, xuất, điều chuyển hoặc điều
              chỉnh tồn kho cho đến khi được mở khóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={props.isUpdating}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={props.isUpdating}
              onClick={() => {
                if (lotToBlock) props.onStatusUpdate(lotToBlock, 'Blocked')
                setLotToBlock(null)
              }}
            >
              {props.isUpdating ? 'Đang khóa…' : 'Khóa lô'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
