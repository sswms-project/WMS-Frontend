import { useMemo, type ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  OperationalEmptyState,
  OperationalErrorState,
  OperationalLoadingState,
} from '@/components/operations/OperationalState'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { cn } from '@/lib/utils'
import type { InventoryFilterOption } from '../../types/inventory.types'
import { computeForecastStats, type ForecastChartPoint } from '../../utils/forecast-chart'
import {
  formatInventoryDateOnly,
  formatInventoryPercent,
  formatInventoryQuantity,
} from '../../utils/inventory-format'
import { InventoryWorkspaceNavigation } from '../InventoryWorkspaceNavigation'

const HORIZON_OPTIONS = [7, 14, 30, 60, 90]

interface InventoryForecastDirectoryProps {
  readonly permissions: readonly string[]
  readonly productId: string
  readonly productOptions: readonly InventoryFilterOption[]
  readonly warehouseId: string
  readonly warehouseOptions: readonly InventoryFilterOption[]
  readonly horizonDays: number
  readonly chartData: readonly ForecastChartPoint[]
  readonly isLoading: boolean
  readonly isFetching: boolean
  readonly isError: boolean
  readonly areProductsLoading: boolean
  readonly areWarehousesLoading: boolean
  readonly onProductChange: (value: string) => void
  readonly onWarehouseChange: (value: string) => void
  readonly onHorizonChange: (value: number) => void
  readonly onRetry: () => void
}

export function InventoryForecastDirectory({
  permissions,
  productId,
  productOptions,
  warehouseId,
  warehouseOptions,
  horizonDays,
  chartData,
  isLoading,
  isFetching,
  isError,
  areProductsLoading,
  areWarehousesLoading,
  onProductChange,
  onWarehouseChange,
  onHorizonChange,
  onRetry,
}: InventoryForecastDirectoryProps) {
  const stats = useMemo(() => computeForecastStats(chartData), [chartData])

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-4">
      <header className="flex shrink-0 flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <TrendingUp aria-hidden="true" />
          </span>
          <div>
            <p className="text-primary text-xs font-medium">Kiểm soát tồn kho</p>
            <h1 className="mt-0.5 text-xl font-semibold">Dự báo tồn kho</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Dự báo mức tồn kho theo sản phẩm dựa trên lịch sử biến động, do dịch vụ AI tính toán.
            </p>
          </div>
        </div>
      </header>
      <InventoryWorkspaceNavigation currentView="forecast" permissions={permissions} />
      <section
        className="bg-card flex min-h-0 min-w-0 flex-1 flex-col border"
        aria-labelledby="forecast-title"
      >
        <div className="flex shrink-0 flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="forecast-title" className="text-sm font-semibold">
            Biểu đồ dự báo
          </h2>
          <div className="flex flex-wrap gap-2">
            <NativeSelect
              aria-label="Chọn sản phẩm"
              className="h-11 min-w-52 sm:h-8"
              value={productId}
              disabled={areProductsLoading}
              onChange={(event) => onProductChange(event.target.value)}
            >
              <NativeSelectOption value="">Chọn sản phẩm</NativeSelectOption>
              {productOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="Lọc dự báo theo kho"
              className="h-11 min-w-44 sm:h-8"
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
            <NativeSelect
              aria-label="Số ngày dự báo"
              className="h-11 min-w-28 sm:h-8"
              value={String(horizonDays)}
              onChange={(event) => onHorizonChange(Number(event.target.value))}
            >
              {HORIZON_OPTIONS.map((days) => (
                <NativeSelectOption key={days} value={days}>
                  {days} ngày
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {isFetching ? 'Đang cập nhật dự báo' : 'Dự báo đã cập nhật'}
        </p>
        {!productId ? (
          <OperationalEmptyState
            title="Chưa chọn sản phẩm"
            description="Chọn một sản phẩm ở trên để xem dự báo tồn kho."
          />
        ) : isLoading ? (
          <OperationalLoadingState rows={8} />
        ) : isError ? (
          <OperationalErrorState title="Không thể tải dự báo tồn kho" onRetry={onRetry} />
        ) : chartData.length === 0 || !stats ? (
          <OperationalEmptyState
            title="Chưa có dữ liệu"
            description="Sản phẩm này chưa có đủ lịch sử biến động để dự báo."
          />
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <ForecastStatsRow stats={stats} />
            <ForecastChart chartData={chartData} boundaryDate={stats.currentDate} />
          </div>
        )}
      </section>
    </div>
  )
}

function ForecastStatsRow({
  stats,
}: {
  readonly stats: NonNullable<ReturnType<typeof computeForecastStats>>
}) {
  const isDecline = stats.changePercent < 0

  return (
    <div className="grid shrink-0 grid-cols-2 divide-x divide-y border-b sm:grid-cols-4 sm:divide-y-0">
      <StatCell
        label="Tồn kho hiện tại"
        value={formatInventoryQuantity(stats.currentQuantity)}
        caption={`Cập nhật ${formatInventoryDateOnly(stats.currentDate)}`}
      />
      <StatCell
        label="Dự báo cuối kỳ"
        value={formatInventoryQuantity(stats.endQuantity)}
        trailing={
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold',
              isDecline ? 'text-destructive' : 'text-primary'
            )}
          >
            {isDecline ? (
              <TrendingDown className="size-3.5" aria-hidden="true" />
            ) : (
              <TrendingUp className="size-3.5" aria-hidden="true" />
            )}
            {formatInventoryPercent(stats.changePercent)}
          </span>
        }
        caption={`So với hiện tại · ${formatInventoryDateOnly(stats.endDate)}`}
      />
      <StatCell
        label="Thay đổi trung bình / ngày"
        value={formatInventoryQuantity(stats.avgDailyChange)}
        valueClassName={stats.avgDailyChange < 0 ? 'text-destructive' : undefined}
        caption="Trung bình trong kỳ dự báo"
      />
      <StatCell
        label="Điểm thấp nhất dự kiến"
        value={formatInventoryQuantity(stats.lowestForecast)}
        caption={`Dự kiến vào ${formatInventoryDateOnly(stats.lowestForecastDate)}`}
      />
    </div>
  )
}

function StatCell({
  label,
  value,
  valueClassName,
  trailing,
  caption,
}: {
  readonly label: string
  readonly value: string
  readonly valueClassName?: string
  readonly trailing?: ReactNode
  readonly caption: string
}) {
  return (
    <div className="flex flex-col gap-1.5 p-3.5">
      <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
        {label}
      </span>
      <span className={cn('text-2xl font-bold', valueClassName)}>{value}</span>
      {trailing}
      <span className="text-muted-foreground text-xs">{caption}</span>
    </div>
  )
}

function ForecastChart({
  chartData,
  boundaryDate,
}: {
  readonly chartData: readonly ForecastChartPoint[]
  readonly boundaryDate: string
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col p-3">
      <div className="mb-2 flex shrink-0 items-center gap-4">
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span className="bg-chart-1 size-2.5" />
          Thực tế
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span className="border-chart-2 w-3.5 border-t-2 border-dashed" />
          Dự báo
        </span>
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
          <span
            className="w-0 border-l border-dashed"
            style={{ height: 10, borderColor: 'var(--muted-foreground)' }}
          />
          Hôm nay
        </span>
      </div>
      <div className="min-h-64 min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={[...chartData]} margin={{ top: 24, right: 28, bottom: 8, left: 4 }}>
            <defs>
              <linearGradient id="forecastActualFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11 }}
              tickFormatter={formatInventoryDateOnly}
            />
            <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} width={56} />
            <Tooltip
              labelFormatter={(value) => formatInventoryDateOnly(String(value))}
              formatter={(value) =>
                typeof value === 'number' ? formatInventoryQuantity(value) : value
              }
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
            <ReferenceLine
              x={boundaryDate}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 4"
              label={{
                value: 'Hôm nay',
                position: 'top',
                fontSize: 11,
                fill: 'var(--muted-foreground)',
              }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              name="Thực tế"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill="url(#forecastActualFill)"
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Dự báo"
              stroke="var(--chart-2)"
              strokeWidth={2.5}
              strokeDasharray="6 5"
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
