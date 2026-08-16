import { RevenueDonutChart, type RevenueDonutDatum } from '../shared/RevenueDonutChart'
import type { WarehouseStats } from '../../types'

interface WarehouseRevenueDonutChartProps {
  warehouses: WarehouseStats[]
}

const TONAL_COLORS = ['var(--chart-tonal-1)', 'var(--chart-tonal-2)', 'var(--chart-tonal-3)']

function getTonalColor(index: number) {
  return TONAL_COLORS[index % TONAL_COLORS.length] ?? 'var(--muted-foreground)'
}

function formatRevenue(value: number) {
  return `${value.toLocaleString('vi-VN')} triệu ₫`
}

export function WarehouseRevenueDonutChart({ warehouses }: WarehouseRevenueDonutChartProps) {
  const sorted = [...warehouses].sort((a, b) => b.revenue - a.revenue)
  const totalRevenue = sorted.reduce((sum, warehouse) => sum + warehouse.revenue, 0)

  const data: RevenueDonutDatum[] = sorted.map((warehouse, index) => ({
    id: warehouse.id,
    label: warehouse.name,
    value: warehouse.revenue,
    color: getTonalColor(index),
  }))

  return (
    <RevenueDonutChart
      title="Doanh thu theo kho"
      subtitle={`Tổng: ${formatRevenue(totalRevenue)}`}
      data={data}
      formatValue={formatRevenue}
      centerContent={
        <div className="flex flex-col items-center">
          <span className="text-foreground text-base leading-tight font-bold">
            {totalRevenue.toLocaleString('vi-VN')}
          </span>
          <span className="text-muted-foreground text-[10px] leading-tight">triệu ₫</span>
        </div>
      }
    />
  )
}
