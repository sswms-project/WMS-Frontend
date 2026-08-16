'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'

export interface RevenueDonutDatum {
  id: string
  label: string
  value: number
  color: string
}

interface RevenueDonutChartProps {
  title: string
  subtitle: string
  data: RevenueDonutDatum[]
  formatValue: (value: number) => string
  centerContent: React.ReactNode
}

export function RevenueDonutChart({
  title,
  subtitle,
  data,
  formatValue,
  centerContent,
}: RevenueDonutChartProps) {
  return (
    <Card className="border-border bg-card p-4 sm:p-5 lg:p-6">
      <div className="mb-4">
        <h3 className="text-foreground text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {data.map((item) => (
                <Cell key={item.id} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
              }}
              formatter={(value) => (typeof value === 'number' ? formatValue(value) : value)}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerContent}
        </div>
      </div>
      <ul className="mt-2 space-y-1.5">
        {data.map((item) => (
          <li key={item.id} className="flex min-w-0 items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="text-foreground truncate">{item.label}</span>
            </span>
            <span className="text-muted-foreground shrink-0">{formatValue(item.value)}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
