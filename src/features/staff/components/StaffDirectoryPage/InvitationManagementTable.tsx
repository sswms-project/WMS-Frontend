import { Building2, LoaderCircle, MailX, MoreHorizontal, RotateCw } from 'lucide-react'
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
import type { InvitationResponse } from '../../types/invitation.types'
import {
  canResendInvitation,
  canRevokeInvitation,
  getInvitationDisplayStatus,
  getInvitationRoleLabel,
} from '../../utils/invitation-status'
import { InvitationStatusBadge } from './InvitationStatusBadge'

interface InvitationManagementTableProps {
  readonly invitations: readonly InvitationResponse[]
  readonly resendingId: string | null
  readonly onResend: (invitation: InvitationResponse) => void
  readonly onRevoke: (invitation: InvitationResponse) => void
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function WarehouseAssignment({ warehouseId }: { readonly warehouseId: string | null }) {
  return warehouseId ? (
    <span className="inline-flex items-center gap-1.5">
      <Building2 className="text-primary size-3.5" aria-hidden="true" />
      Đã chọn kho
    </span>
  ) : (
    <span className="text-muted-foreground">Chưa chọn kho</span>
  )
}

export function InvitationManagementTable({
  invitations,
  resendingId,
  onResend,
  onRevoke,
}: InvitationManagementTableProps) {
  function rowActions(invitation: InvitationResponse) {
    const canResend = canResendInvitation(invitation)
    const canRevoke = canRevokeInvitation(invitation)
    const isResending = resendingId === invitation.id

    if (!canResend && !canRevoke) {
      return <span className="sr-only">Không có thao tác khả dụng</span>
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 md:size-8"
            disabled={isResending}
            aria-label={
              isResending
                ? `Đang gửi lại lời mời tới ${invitation.email}`
                : `Thao tác với ${invitation.email}`
            }
          >
            {isResending ? (
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <MoreHorizontal className="size-4" aria-hidden="true" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canResend && (
            <DropdownMenuItem disabled={isResending} onSelect={() => onResend(invitation)}>
              <RotateCw className="size-4" aria-hidden="true" />
              Gửi lại lời mời
            </DropdownMenuItem>
          )}
          {canRevoke && (
            <DropdownMenuItem variant="destructive" onSelect={() => onRevoke(invitation)}>
              <MailX className="size-4" aria-hidden="true" />
              Thu hồi lời mời
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Người nhận</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead>Hết hạn</TableHead>
              <TableHead className="w-20">
                <span className="sr-only">Thao tác</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow
                key={invitation.id}
                className="transition-colors duration-200 motion-reduce:transition-none"
              >
                <TableCell className="max-w-64 pl-4 font-medium">
                  <span className="block truncate" title={invitation.email}>
                    {invitation.email}
                  </span>
                </TableCell>
                <TableCell>{getInvitationRoleLabel(invitation.role)}</TableCell>
                <TableCell>
                  <WarehouseAssignment warehouseId={invitation.warehouseId} />
                </TableCell>
                <TableCell>
                  <InvitationStatusBadge status={getInvitationDisplayStatus(invitation)} />
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDateTime(invitation.createdAt)}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDateTime(invitation.expiresAt)}
                </TableCell>
                <TableCell>{rowActions(invitation)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y md:hidden">
        {invitations.map((invitation) => (
          <article key={invitation.id} className="space-y-3 px-3 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium break-all">{invitation.email}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {getInvitationRoleLabel(invitation.role)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <InvitationStatusBadge status={getInvitationDisplayStatus(invitation)} />
                {rowActions(invitation)}
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-muted-foreground">Phân công</dt>
                <dd className="mt-0.5">
                  <WarehouseAssignment warehouseId={invitation.warehouseId} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Ngày gửi</dt>
                <dd className="mt-0.5">{formatDateTime(invitation.createdAt)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Hết hạn</dt>
                <dd className="mt-0.5">{formatDateTime(invitation.expiresAt)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  )
}
