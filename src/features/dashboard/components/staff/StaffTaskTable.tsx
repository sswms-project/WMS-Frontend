'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { StaffTask } from '../../types'

interface StaffTaskTableProps {
  tasks: StaffTask[]
}

const statusConfig = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'CHỜ XỬ LÝ' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'ĐANG THỰC HIỆN' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'HOÀN TẤT' },
}

const taskTypeLabels = {
  Picking: 'Lấy hàng',
  Packing: 'Đóng gói',
  Putaway: 'Cất hàng',
}

export function StaffTaskTable({ tasks }: StaffTaskTableProps) {
  return (
    <Card className="border-border bg-card">
      <div className="border-border border-b px-4 py-4 sm:px-6">
        <h3 className="text-foreground text-lg font-semibold">Công việc của tôi</h3>
      </div>

      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead className="text-muted-foreground px-4 text-xs font-semibold uppercase sm:px-6">
              Công việc
            </TableHead>
            <TableHead className="text-muted-foreground px-4 text-xs font-semibold uppercase sm:px-6">
              SKU
            </TableHead>
            <TableHead className="text-muted-foreground px-4 text-xs font-semibold uppercase sm:px-6">
              Vị trí
            </TableHead>
            <TableHead className="text-muted-foreground px-4 text-xs font-semibold uppercase sm:px-6">
              Hạn hoàn thành
            </TableHead>
            <TableHead className="text-muted-foreground px-4 text-xs font-semibold uppercase sm:px-6">
              Trạng thái
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const statusStyle = statusConfig[task.status]
            return (
              <TableRow key={task.id}>
                <TableCell className="text-foreground px-4 py-4 text-sm font-semibold sm:px-6">
                  {taskTypeLabels[task.type]}
                </TableCell>
                <TableCell className="text-foreground px-4 py-4 font-mono text-sm sm:px-6">
                  {task.sku}
                </TableCell>
                <TableCell className="text-muted-foreground px-4 py-4 text-xs sm:px-6">
                  {task.location}
                </TableCell>
                <TableCell className="text-muted-foreground px-4 py-4 text-xs sm:px-6">
                  {task.dueTime}
                </TableCell>
                <TableCell className="px-4 py-4 sm:px-6">
                  <Badge
                    className={`${statusStyle.bg} ${statusStyle.text} border-0 text-xs font-semibold`}
                  >
                    {statusStyle.label}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
