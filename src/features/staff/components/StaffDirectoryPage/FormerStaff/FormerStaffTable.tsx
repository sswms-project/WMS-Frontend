import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { FormerStaffResponse } from '../../../types/staff.types'
import { formatEmploymentDate } from '../../../utils/staff-employment'

interface FormerStaffTableProps {
  readonly people: readonly FormerStaffResponse[]
  readonly onViewHistory: (person: FormerStaffResponse) => void
}

export function FormerStaffTable({ people, onViewHistory }: FormerStaffTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="sticky top-0 z-10">Nhân sự</TableHead>
          <TableHead className="sticky top-0 z-10">Vai trò gần nhất</TableHead>
          <TableHead className="sticky top-0 z-10">Số lần làm việc</TableHead>
          <TableHead className="sticky top-0 z-10">Bắt đầu đầu tiên</TableHead>
          <TableHead className="sticky top-0 z-10">Nghỉ gần nhất</TableHead>
          <TableHead className="sticky top-0 z-10">
            <span className="sr-only">Thao tác</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => (
          <TableRow key={person.userId}>
            <TableCell>
              <p className="text-sm font-medium">{person.fullName}</p>
              <p className="text-muted-foreground text-xs">{person.email}</p>
            </TableCell>
            <TableCell>{person.role ?? '—'}</TableCell>
            <TableCell className="tabular-nums">{person.periodCount}</TableCell>
            <TableCell className="tabular-nums">
              {person.firstStartDate ? formatEmploymentDate(person.firstStartDate) : '—'}
            </TableCell>
            <TableCell className="tabular-nums">
              {person.lastEndDate ? formatEmploymentDate(person.lastEndDate) : 'Chưa rõ'}
            </TableCell>
            <TableCell className="text-right">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onViewHistory(person)}
              >
                <History data-icon="inline-start" aria-hidden="true" />
                Lịch sử
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
