import { RevenueDonutChart, type RevenueDonutDatum } from '../shared/RevenueDonutChart'

interface RevenueTargetDonutChartProps {
  revenue: number
  target: number
}

function formatRevenue(value: number) {
  return `${value.toLocaleString('vi-VN')} triệu ₫`
}

export function RevenueTargetDonutChart({ revenue, target }: RevenueTargetDonutChartProps) {
  const achieved = Math.min(revenue, target)
  const remaining = Math.max(target - revenue, 0)
  const percentage = target > 0 ? Math.round((revenue / target) * 100) : 0

  const data: RevenueDonutDatum[] = [
    { id: 'achieved', label: 'Đã đạt', value: achieved, color: 'var(--chart-tonal-1)' },
    { id: 'remaining', label: 'Còn lại', value: remaining, color: 'var(--muted)' },
  ]

  return (
    <RevenueDonutChart
      title="Doanh thu kho"
      subtitle={`${formatRevenue(revenue)} / ${formatRevenue(target)} mục tiêu tháng`}
      data={data}
      formatValue={formatRevenue}
      centerContent={
        <div className="flex flex-col items-center">
          <span className="text-foreground text-xl leading-tight font-bold">{percentage}%</span>
          <span className="text-muted-foreground text-[10px] leading-tight">mục tiêu</span>
        </div>
      }
    />
  )
}
