import type { DateRange } from 'react-day-picker'
import type { DashboardMetric } from '../types'

export function getDefaultMetricsDateRange(): DateRange {
  const year = new Date().getFullYear()
  return { from: new Date(year, 0, 1), to: new Date(year, 11, 31) }
}

export function filterMetricsByDateRange(
  metrics: DashboardMetric[],
  range: DateRange | undefined
): DashboardMetric[] {
  if (!range?.from) return metrics

  const from = range.from
  const to = range.to ?? range.from

  return metrics.map((metric) => {
    if (!metric.monthlyTrend) return metric

    return {
      ...metric,
      monthlyTrend: metric.monthlyTrend.filter((point) => point.date >= from && point.date <= to),
    }
  })
}
