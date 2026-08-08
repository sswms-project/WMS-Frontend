import { Eye, MoreHorizontal, ShieldCheck, UserRoundCheck, UserRoundX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  STAFF_DIRECTORY_KINDS,
  type StaffDirectoryKind,
  type StaffLifecycleAction,
  type StaffResponse,
} from '../../types/staff.types'
import { getStaffLifecycleAction } from '../../utils/staff-status'
import { StaffStatusBadge } from './StaffStatusBadge'

interface StaffDirectoryTableProps {
  readonly kind: StaffDirectoryKind
  readonly people: readonly StaffResponse[]
  readonly onView: (person: StaffResponse) => void
  readonly onLifecycleAction: (person: StaffResponse, action: StaffLifecycleAction) => void
}

function formatLastLogin(value: string | null) {
  if (!value) return 'Chưa đăng nhập'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value)
  )
}

function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function StaffDirectoryTable({
  kind,
  people,
  onView,
  onLifecycleAction,
}: StaffDirectoryTableProps) {
  function actionFor(person: StaffResponse) {
    return kind === STAFF_DIRECTORY_KINDS.staff ? getStaffLifecycleAction(person.status) : null
  }

  function actionItem(person: StaffResponse, action: StaffLifecycleAction) {
    const isDeactivate = action === 'deactivate'
    const Icon = isDeactivate ? UserRoundX : UserRoundCheck
    return (
      <DropdownMenuItem
        variant={isDeactivate ? 'destructive' : 'default'}
        onSelect={() => onLifecycleAction(person, action)}
      >
        <Icon className="size-4" aria-hidden="true" />
        {isDeactivate ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt lại tài khoản'}
      </DropdownMenuItem>
    )
  }

  function rowActions(person: StaffResponse) {
    const action = actionFor(person)
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Thao tác với ${person.fullName}`}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onView(person)}>
            <Eye className="size-4" aria-hidden="true" />
            Xem chi tiết
          </DropdownMenuItem>
          {action && actionItem(person, action)}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Nhân sự</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Lần đăng nhập cuối</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Thao tác</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-muted text-foreground flex size-8 items-center justify-center text-[11px] font-semibold">
                      {initials(person.fullName)}
                    </span>
                    <span className="font-medium">{person.fullName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-56">
                    <p className="truncate">{person.email}</p>
                    <p className="text-muted-foreground mt-0.5 truncate">
                      {person.phone || 'Chưa có số điện thoại'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="text-muted-foreground size-3.5" aria-hidden="true" />
                    {person.role || 'Chưa gán'}
                  </span>
                </TableCell>
                <TableCell>
                  <StaffStatusBadge status={person.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatLastLogin(person.lastLoginAt)}
                </TableCell>
                <TableCell>{rowActions(person)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y md:hidden">
        {people.map((person) => (
          <div key={person.id} className="flex min-h-20 items-center gap-3 px-3 py-3">
            <span className="bg-muted flex size-9 shrink-0 items-center justify-center text-xs font-semibold">
              {initials(person.fullName)}
            </span>
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onView(person)}
            >
              <span className="block truncate text-sm font-medium">{person.fullName}</span>
              <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                {person.email}
              </span>
              <span className="mt-1 block">
                <StaffStatusBadge status={person.status} />
              </span>
            </button>
            {rowActions(person)}
          </div>
        ))}
      </div>
    </>
  )
}
