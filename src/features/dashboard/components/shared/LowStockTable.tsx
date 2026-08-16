'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

interface LowStockItem {
  id: string
  sku: string
  name: string
  quantity: number
  threshold: number
  location: string
}

interface LowStockTableProps {
  items: LowStockItem[]
}

export function LowStockTable({ items }: LowStockTableProps) {
  const getCriticalityLevel = (quantity: number, threshold: number) => {
    const percentage = (quantity / threshold) * 100
    if (percentage < 25) return { label: 'Nguy cấp', color: 'bg-red-100 text-red-800' }
    if (percentage < 50) return { label: 'Thấp', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Trung bình', color: 'bg-orange-100 text-orange-800' }
  }

  return (
    <Card className="border-border bg-card">
      <div className="border-border border-b px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-yellow-600" />
          <h3 className="text-foreground text-lg font-semibold">SKU sắp hết hàng</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-border border-b">
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase sm:px-6">
                SKU
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase sm:px-6">
                Tên sản phẩm
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase sm:px-6">
                Số lượng
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase sm:px-6">
                Ngưỡng tối thiểu
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase sm:px-6">
                Vị trí
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold uppercase sm:px-6">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const criticality = getCriticalityLevel(item.quantity, item.threshold)
              return (
                <tr
                  key={item.id}
                  className="border-border hover:bg-muted/30 border-b transition-colors"
                >
                  <td className="px-4 py-4 sm:px-6">
                    <span className="text-foreground font-mono text-sm font-semibold">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className="text-foreground text-sm">{item.name}</span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className="text-foreground text-sm font-semibold">{item.quantity}</span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className="text-muted-foreground text-sm">{item.threshold}</span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className="text-muted-foreground text-xs">{item.location}</span>
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <Badge className={`${criticality.color} border-0 text-xs font-semibold`}>
                      {criticality.label}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
