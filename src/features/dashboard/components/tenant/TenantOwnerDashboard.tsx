'use client'

import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { DashboardHeader } from '../shared/DashboardHeader'
import { MetricCardGrid } from '../shared/MetricCardGrid'
import { QuickActionsBar } from '../shared/QuickActionsBar'
import { WarehouseCapacitySection } from './WarehouseCapacitySection'
import { DateRangeFilter } from '../shared/DateRangeFilter'
import { LogisticsFluxChart } from '../shared/LogisticsFluxChart'
import { WarehouseRevenueDonutChart } from './WarehouseRevenueDonutChart'
import { RecentOperationsTable } from '../shared/RecentOperationsTable'
import { AlertCard } from '../shared/AlertCard'
import { LowStockTable } from '../shared/LowStockTable'
import { FadeIn } from '../shared/FadeIn'
import { useSubscriptionReadOnly } from '@/features/subscription/components/SubscriptionReadOnlyProvider'
import {
  tenantOwnerMetrics,
  tenantOwnerQuickActions,
  warehouseStats,
  chartData,
  recentOperations,
  lowStockItems,
} from '../../utils/sample-data'
import { getDefaultMetricsDateRange, filterMetricsByDateRange } from '../../utils/date-range'

export function TenantOwnerDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultMetricsDateRange())
  const { isReadOnly, reason: readOnlyReason } = useSubscriptionReadOnly()

  const filteredMetrics = useMemo(
    () => filterMetricsByDateRange(tenantOwnerMetrics, dateRange),
    [dateRange]
  )

  return (
    <div className="space-y-6">
      <FadeIn>
        <DashboardHeader
          title="Bảng điều khiển vận hành kho"
          description="Tổng quan chuỗi cung ứng theo thời gian thực cho tất cả các kho"
          actions={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <QuickActionsBar
          actions={tenantOwnerQuickActions}
          readOnly={isReadOnly}
          readOnlyReason={readOnlyReason}
        />
      </FadeIn>

      <MetricCardGrid metrics={filteredMetrics} />

      <FadeIn delay={0.3}>
        <AlertCard
          type="info"
          title="Đề xuất thông minh"
          description="Đề xuất nhập thêm SKU-182 tại Zone A — dự báo nhu cầu cao cho ca làm việc tiếp theo."
          actionLabel="Thực hiện nhập kho"
          disabled={isReadOnly}
          disabledReason={readOnlyReason}
        />
      </FadeIn>

      <FadeIn delay={0.35}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LogisticsFluxChart data={chartData} />
          </div>
          <div className="lg:col-span-1">
            <WarehouseRevenueDonutChart warehouses={warehouseStats} />
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
          <WarehouseCapacitySection warehouses={warehouseStats} />
        </FadeIn>
      </div>
    </div>
  )
}
