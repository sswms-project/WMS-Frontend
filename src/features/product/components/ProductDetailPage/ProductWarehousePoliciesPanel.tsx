import { RefreshCw, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProductWarehousePolicy } from '../../types/product.types'

interface ProductWarehousePoliciesPanelProps {
  readonly policies: readonly ProductWarehousePolicy[]
  readonly isLoading: boolean
  readonly isError: boolean
  readonly canManage: boolean
  readonly onRetry: () => void
  readonly onConfigure: () => void
}

export function ProductWarehousePoliciesPanel({
  policies,
  isLoading,
  isError,
  canManage,
  onRetry,
  onConfigure,
}: ProductWarehousePoliciesPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Chính sách tồn kho theo kho</CardTitle>
          <CardDescription>Mỗi kho có ngưỡng và phân loại ABC riêng cho sản phẩm.</CardDescription>
        </div>
        {canManage ? (
          <Button type="button" variant="outline" size="sm" onClick={onConfigure}>
            <Settings2 data-icon="inline-start" aria-hidden="true" />
            Cấu hình
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : isError ? (
          <Empty className="min-h-40 border">
            <EmptyHeader>
              <EmptyTitle>Không thể tải chính sách tồn kho</EmptyTitle>
              <EmptyDescription>
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                  <RefreshCw data-icon="inline-start" aria-hidden="true" />
                  Thử lại
                </Button>
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : policies.length === 0 ? (
          <Empty className="min-h-40 border">
            <EmptyHeader>
              <EmptyTitle>Chưa có chính sách theo kho</EmptyTitle>
              <EmptyDescription>
                {canManage
                  ? 'Chọn Cấu hình để đặt ngưỡng cho một kho.'
                  : 'Sản phẩm chưa được cấu hình ngưỡng tồn kho riêng cho kho nào.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kho</TableHead>
                <TableHead className="text-right">Tối thiểu</TableHead>
                <TableHead className="text-right">Tối đa</TableHead>
                <TableHead className="text-right">Điểm đặt hàng lại</TableHead>
                <TableHead className="text-right">An toàn</TableHead>
                <TableHead className="text-right">Cung ứng</TableHead>
                <TableHead>ABC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <p className="font-medium">{policy.warehouseName}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {policy.warehouseCode}
                    </p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {policy.minStockThreshold}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {policy.maxStockThreshold ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {policy.reorderPoint ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{policy.safetyStock}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {policy.leadTimeDays ? `${policy.leadTimeDays} ngày` : '—'}
                  </TableCell>
                  <TableCell>{policy.abcClass ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
