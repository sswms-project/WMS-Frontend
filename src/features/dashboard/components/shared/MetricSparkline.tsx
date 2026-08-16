'use client'

import { Line, LineChart, ResponsiveContainer } from 'recharts'
import type { MetricTrendPoint } from '../../types'

interface MetricSparklineProps {
  data: MetricTrendPoint[]
  trend: 'up' | 'down'
}

export function MetricSparkline({ data, trend }: MetricSparklineProps) {
  if (data.length < 2) return null

  const color = trend === 'up' ? 'var(--chart-positive)' : 'var(--chart-negative)'

  return (
    <div className="h-10 w-20 shrink-0" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="linear"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
