import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { StaffEmploymentPeriod } from '../../../types/staff.types'
import { getEmploymentPeriodLabel } from '../../../utils/staff-employment'

interface EmploymentPeriodListProps {
  readonly periods: readonly StaffEmploymentPeriod[]
  readonly canEdit: boolean
  readonly onEdit: (period: StaffEmploymentPeriod) => void
}

export function EmploymentPeriodList({ periods, canEdit, onEdit }: EmploymentPeriodListProps) {
  return (
    <ul className="divide-y border-t">
      {periods.map((period) => (
        <li key={period.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium tabular-nums">{getEmploymentPeriodLabel(period)}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {period.isCurrentAccount ? 'Tài khoản hiện tại' : 'Tài khoản đã chấm dứt trước đó'}
            </p>
          </div>
          {period.isCurrent && <Badge variant="secondary">Đang làm</Badge>}
          {period.isEndDateUnknown && <Badge variant="outline">Chưa rõ ngày nghỉ</Badge>}
          {!period.isCurrent && !period.isEndDateUnknown && (
            <Badge variant="outline">Đã nghỉ</Badge>
          )}
          {canEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Sửa giai đoạn ${getEmploymentPeriodLabel(period)}`}
              onClick={() => onEdit(period)}
            >
              <Pencil aria-hidden="true" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
