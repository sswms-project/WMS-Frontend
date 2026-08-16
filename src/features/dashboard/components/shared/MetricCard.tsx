import type { DashboardMetric, MetricTrendPoint } from '../../types'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { AnimatedMetricValue } from './AnimatedMetricValue'
import { MetricSparkline } from './MetricSparkline'

interface MetricCardProps {
  metric: DashboardMetric
}

function getSparklineTrend(points: MetricTrendPoint[] | undefined, fallbackPositive: boolean) {
  const first = points?.[0]
  const last = points?.[points.length - 1]
  if (first && last) return last.value >= first.value ? 'up' : 'down'
  return fallbackPositive ? 'up' : 'down'
}

export function MetricCard({ metric }: MetricCardProps) {
  const isPositiveChange = metric.change ? metric.change > 0 : false
  const trendPoints = metric.monthlyTrend
  const sparklineTrend = getSparklineTrend(trendPoints, isPositiveChange)

  return (
    <Card className="border-border bg-card hover:ring-primary/30 p-4 transition-shadow duration-200 sm:p-5 lg:p-6">
      <div className="flex h-full flex-col space-y-4">
        <div className="flex items-start justify-between">
          <p className="text-muted-foreground line-clamp-2 min-h-10 text-sm font-semibold tracking-wide uppercase">
            {metric.label}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex min-w-0 items-end justify-between gap-3">
            <AnimatedMetricValue
              value={metric.value}
              className="text-foreground min-w-0 text-3xl font-bold sm:text-4xl"
            />
            {trendPoints && trendPoints.length > 1 && (
              <MetricSparkline data={trendPoints} trend={sparklineTrend} />
            )}
          </div>

          {metric.change !== undefined && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {isPositiveChange ? (
                <TrendingUp className="size-4 shrink-0 text-green-600" />
              ) : (
                <TrendingDown className="size-4 shrink-0 text-red-600" />
              )}
              <span
                className={`shrink-0 text-sm font-semibold ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}
              >
                {isPositiveChange ? '+' : ''}
                {metric.change}%
              </span>
              {metric.changeLabel && (
                <span className="text-muted-foreground min-w-0 text-xs">{metric.changeLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
