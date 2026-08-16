import type { DashboardMetric } from '../../types'
import { FadeIn } from './FadeIn'
import { MetricCard } from './MetricCard'

interface MetricCardGridProps {
  metrics: DashboardMetric[]
}

export function MetricCardGrid({ metrics }: MetricCardGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <FadeIn key={metric.label} delay={0.05 + index * 0.05}>
          <MetricCard metric={metric} />
        </FadeIn>
      ))}
    </div>
  )
}
