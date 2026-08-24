import { ChartNoAxesColumnIncreasing, RefreshCw, TriangleAlert } from 'lucide-react'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { InventoryAbcItem, InventoryFilterOption } from '../../types/inventory.types'
import { formatInventoryQuantity } from '../../utils/inventory-format'
import { InventoryWorkspaceNavigation } from '../InventoryWorkspaceNavigation'

interface InventoryAbcDirectoryProps {
  readonly items: readonly InventoryAbcItem[]
  readonly warehouseId: string
  readonly warehouseOptions: readonly InventoryFilterOption[]
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly areWarehousesLoading: boolean
  readonly areWarehousesError: boolean
  readonly onWarehouseChange: (value: string) => void
  readonly onRetryWarehouses: () => void
  readonly onRetry: () => void
}

const classStyles: Record<string, string> = {
  A: 'border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400',
  B: 'border-amber-600/30 bg-amber-600/10 text-amber-700 dark:text-amber-400',
  C: 'border-sky-600/30 bg-sky-600/10 text-sky-700 dark:text-sky-400',
}

export function InventoryAbcDirectory({
  items,
  warehouseId,
  warehouseOptions,
  isLoading,
  isFetching,
  isError,
  areWarehousesLoading,
  areWarehousesError,
  onWarehouseChange,
  onRetryWarehouses,
  onRetry,
}: InventoryAbcDirectoryProps) {
  const counts: Record<string, number> = {
    A: items.filter((item) => item.class === 'A').length,
    B: items.filter((item) => item.class === 'B').length,
    C: items.filter((item) => item.class === 'C').length,
  }
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <ChartNoAxesColumnIncreasing aria-hidden="true" />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Kiểm soát tồn kho</p>
            <h1 className="mt-0.5 text-xl font-semibold">Phân loại tồn kho ABC</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Phân nhóm sản phẩm theo tỷ trọng số lượng tồn hiện tại.
            </p>
          </div>
        </div>
        <div className="border-primary/20 bg-primary/5 flex min-h-10 items-center gap-2 border px-3">
          <ChartNoAxesColumnIncreasing className="text-primary size-4" aria-hidden="true" />
          <span className="text-xs font-medium tabular-nums">{items.length} sản phẩm</span>
        </div>
      </header>
      <InventoryWorkspaceNavigation currentView="abc" />
      <section className="grid shrink-0 grid-cols-3 border" aria-label="Phân bố nhóm ABC">
        {['A', 'B', 'C'].map((className) => (
          <div
            key={className}
            className="flex min-w-0 items-center gap-2 border-r px-3 py-2 last:border-r-0"
          >
            <Badge variant="outline" className={classStyles[className]}>
              Nhóm {className}
            </Badge>
            <span className="text-xs font-medium tabular-nums">{counts[className] ?? 0}</span>
          </div>
        ))}
      </section>
      <section className="bg-card flex min-h-0 flex-col border" aria-labelledby="abc-title">
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="abc-title" className="text-sm font-semibold">
              Kết quả phân loại
            </h2>
            <p className="text-muted-foreground text-xs">
              Class do backend tính theo tỷ lệ tích lũy số lượng.
            </p>
          </div>
          <div className="flex gap-2">
            <NativeSelect
              aria-label="Lọc phân loại theo kho"
              className="h-11 min-w-52 sm:h-8"
              value={warehouseId}
              disabled={areWarehousesLoading}
              onChange={(event) => onWarehouseChange(event.target.value)}
            >
              <NativeSelectOption value="">Tất cả kho</NativeSelectOption>
              {warehouseOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-11 sm:size-8"
                  disabled={isFetching}
                  aria-label="Làm mới phân loại ABC"
                  onClick={onRetry}
                >
                  <RefreshCw
                    className={isFetching ? 'animate-spin motion-reduce:animate-none' : undefined}
                    aria-hidden="true"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>Làm mới phân loại</TooltipContent>
            </Tooltip>
          </div>
        </div>
        {areWarehousesError ? (
          <div className="border-b px-3 py-2 text-xs" role="alert">
            <span className="text-destructive inline-flex items-center gap-2">
              <TriangleAlert className="size-4" aria-hidden="true" />
              Không thể tải danh sách kho.
            </span>{' '}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={onRetryWarehouses}
            >
              Thử lại
            </Button>
          </div>
        ) : null}
        <p className="sr-only" aria-live="polite">
          {isFetching ? 'Đang cập nhật phân loại ABC' : 'Phân loại ABC đã cập nhật'}
        </p>
        {isLoading ? (
          <OperationalLoadingState rows={8} />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải phân loại ABC" onRetry={onRetry} />
        ) : items.length === 0 ? (
          <OperationalEmptyState
            title="Chưa có dữ liệu phân loại"
            description={
              warehouseId
                ? 'Kho đã chọn chưa có tồn kho dương để phân loại.'
                : 'Chưa có tồn kho dương để tạo phân loại ABC.'
            }
          />
        ) : (
          <AbcResults items={items} />
        )}
      </section>
    </div>
  )
}

function AbcResults({ items }: { readonly items: readonly InventoryAbcItem[] }) {
  return (
    <>
      <ItemGroup className="gap-0 md:hidden">
        {items.map((item) => (
          <Item key={item.productId} className="border-b last:border-b-0">
            <ItemContent>
              <ItemTitle className="flex justify-between gap-3">
                <span className="truncate">{item.productName || 'Sản phẩm chưa xác định'}</span>
                <Badge variant="outline" className={classStyles[item.class]}>
                  Nhóm {item.class}
                </Badge>
              </ItemTitle>
              <ItemDescription>
                <span className="font-mono">{item.sku || item.productId}</span> ·{' '}
                {formatInventoryQuantity(item.totalQuantity)} đơn vị
              </ItemDescription>
              <ItemDescription>
                Tích lũy {item.cumulativePercentage.toLocaleString('vi-VN')}%
              </ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
      <div className="hidden min-h-0 flex-1 overflow-auto md:block">
        <Table className="min-w-[760px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-card sticky top-0 z-10 w-80">Sản phẩm</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 w-32 text-right">
                Tổng số lượng
              </TableHead>
              <TableHead className="bg-card sticky top-0 z-10 w-36 text-right">
                Tỷ lệ tích lũy
              </TableHead>
              <TableHead className="bg-card sticky top-0 z-10 w-28 text-center">Nhóm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <p className="truncate font-medium">
                    {item.productName || 'Sản phẩm chưa xác định'}
                  </p>
                  <p className="text-muted-foreground truncate font-mono text-xs">
                    {item.sku || item.productId}
                  </p>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatInventoryQuantity(item.totalQuantity)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {item.cumulativePercentage.toLocaleString('vi-VN')}%
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={classStyles[item.class]}>
                    Nhóm {item.class}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
