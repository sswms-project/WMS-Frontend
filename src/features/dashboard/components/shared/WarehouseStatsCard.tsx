import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { WarehouseStats } from '../../types'

interface WarehouseStatsCardProps {
  warehouse: WarehouseStats
}

export function WarehouseStatsCard({ warehouse }: WarehouseStatsCardProps) {
  const capacityPercentage = (warehouse.usedCapacity / warehouse.totalCapacity) * 100

  return (
    <Card className="hover:ring-primary/30 p-4 transition-shadow duration-200 sm:p-6">
      <div className="space-y-4">
        <div>
          <h4 className="text-foreground font-semibold">{warehouse.name}</h4>
          <p className="text-muted-foreground text-sm">Mã: {warehouse.id}</p>
        </div>

        <div>
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-foreground text-sm font-medium">Mức sử dụng sức chứa</span>
            <span className="text-foreground text-sm font-semibold">
              {capacityPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={capacityPercentage} className="h-2" />
          <p className="text-muted-foreground mt-1 text-xs">
            {warehouse.usedCapacity.toLocaleString()} / {warehouse.totalCapacity.toLocaleString()}{' '}
            đơn vị
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">Đơn đang xử lý</p>
            <p className="text-foreground text-xl font-semibold">{warehouse.activeOrders}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">Nhân sự</p>
            <p className="text-foreground text-xl font-semibold">{warehouse.staffCount}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
