'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Package, Shuffle, AlertTriangle, ClipboardCheck } from 'lucide-react'
import type { RecentOperation } from '../../types'

interface RecentOperationsTableProps {
  operations: RecentOperation[]
}

const statusConfig = {
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'HOÀN TẤT' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'ĐANG XỬ LÝ' },
  flagged: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'CẢNH BÁO' },
  scheduled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'ĐÃ LÊN LỊCH' },
}

const typeIcons = {
  inbound: Package,
  transfer: Shuffle,
  alert: AlertTriangle,
  audit: ClipboardCheck,
}

export function RecentOperationsTable({ operations }: RecentOperationsTableProps) {
  return (
    <Card className="border-border bg-card">
      <div className="border-border border-b px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-foreground text-lg font-semibold">Hoạt động gần đây</h3>
          <Button variant="ghost" size="sm" className="text-primary w-fit">
            Xem tất cả nhật ký
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>

      <div className="divide-border divide-y">
        {operations.map((op) => {
          const Icon = typeIcons[op.type]
          const statusStyle = statusConfig[op.status]

          return (
            <div
              key={op.id}
              className="border-border hover:bg-muted/30 flex items-start gap-3 px-4 py-4 transition-colors sm:gap-4 sm:px-6"
            >
              <div className="mt-1 flex-shrink-0">
                <div className="bg-primary/10 rounded-md p-2">
                  <Icon className="text-primary size-5" />
                </div>
              </div>

              <div className="flex-grow">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-semibold">{op.title}</p>
                    <p className="text-muted-foreground mt-1 text-sm">{op.description}</p>
                  </div>
                  <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <p className="text-muted-foreground text-xs font-medium">{op.timestamp}</p>
                    <Badge className={`border-0 ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
