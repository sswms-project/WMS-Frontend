'use client'

import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { DashboardHeader } from '../shared/DashboardHeader'
import { MetricCardGrid } from '../shared/MetricCardGrid'
import { QuickActionsBar } from '../shared/QuickActionsBar'
import { WarehouseStatsCard } from '../shared/WarehouseStatsCard'
import { DateRangeFilter } from '../shared/DateRangeFilter'
import { LogisticsFluxChart } from '../shared/LogisticsFluxChart'
import { RevenueTargetDonutChart } from './RevenueTargetDonutChart'
import { RecentOperationsTable } from '../shared/RecentOperationsTable'
import { AlertCard } from '../shared/AlertCard'
import { LowStockTable } from '../shared/LowStockTable'
import { FadeIn } from '../shared/FadeIn'
import {
  warehouseManagerMetrics,
  warehouseManagerQuickActions,
  warehouseStats,
  chartData,
  recentOperations,
  lowStockItems,
} from '../../utils/sample-data'
import { getDefaultMetricsDateRange, filterMetricsByDateRange } from '../../utils/date-range'

export function WarehouseManagerDashboard() {
  const managerWarehouse = warehouseStats.slice(0, 1)
  const primaryWarehouse = warehouseStats[0]
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultMetricsDateRange())

  const filteredMetrics = useMemo(
    () => filterMetricsByDateRange(warehouseManagerMetrics, dateRange),
    [dateRange]
  )

  if (!primaryWarehouse) return null

  return (
    <div className="space-y-6">
      <FadeIn>
        <DashboardHeader
          title="Bảng điều khiển vận hành kho"
          description="Tổng quan vận hành theo thời gian thực tại Kho Chính"
          actions={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <QuickActionsBar actions={warehouseManagerQuickActions} />
      </FadeIn>

      <MetricCardGrid metrics={filteredMetrics} />

      <FadeIn delay={0.3}>
        <AlertCard
          type="warning"
          title="Cần chú ý"
          description="Sức chứa Zone C đã đạt 95%. Còn 42 đơn lấy hàng chờ xử lý cho ca tiếp theo — ưu tiên các SKU luân chuyển nhanh."
          actionLabel="Xem sơ đồ khu vực"
        />
      </FadeIn>

      <FadeIn delay={0.35}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LogisticsFluxChart data={chartData} />
          </div>
          <div className="lg:col-span-1">
            <RevenueTargetDonutChart
              revenue={primaryWarehouse.revenue}
              target={primaryWarehouse.revenueTarget}
            />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.4}>
        <RecentOperationsTable operations={recentOperations} />
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.45}>
          <LowStockTable items={lowStockItems} />
        </FadeIn>

        <FadeIn delay={0.5}>
          <h2 className="text-foreground mb-4 text-lg font-semibold">Tình trạng kho</h2>
          <div className="grid gap-4">
            {managerWarehouse.map((warehouse) => (
              <WarehouseStatsCard key={warehouse.id} warehouse={warehouse} />
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
