'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LogisticsFluxChartProps {
  data: Array<{
    day: string
    inbound: number
    outbound: number
  }>
}

export function LogisticsFluxChart({ data }: LogisticsFluxChartProps) {
  return (
    <Card className="border-border bg-card p-4 sm:p-5 lg:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-foreground text-lg font-semibold">Dự báo AI: Luồng hàng hóa</h3>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 text-xs">
            <span className="bg-chart-1 h-3 w-3 rounded" />
            Nhập kho
          </span>
          <span className="inline-flex items-center gap-2 text-xs">
            <span className="bg-chart-2 h-3 w-3 rounded" />
            Xuất kho
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="day" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
            }}
            formatter={(value) =>
              typeof value === 'number' ? value.toLocaleString('vi-VN') : value
            }
          />
          <Bar dataKey="inbound" name="Nhập kho" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="outbound" name="Xuất kho" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
