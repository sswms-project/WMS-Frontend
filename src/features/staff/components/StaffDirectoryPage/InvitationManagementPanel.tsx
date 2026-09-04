import { LoaderCircle, Mail, RefreshCw, Send, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { InvitationResponse } from '../../types/invitation.types'
import { StaffDirectoryPagination } from './StaffDirectoryPagination'

interface InvitationManagementPanelProps {
  readonly invitations: InvitationResponse[]
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isFetching: boolean
  readonly resendingId: string | null
  readonly onPageChange: (page: number) => void
  readonly onRefresh: () => void
  readonly onResend: (invitation: InvitationResponse) => void
  readonly onRevoke: (invitation: InvitationResponse) => void
}

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Chờ xác nhận',
  Accepted: 'Đã chấp nhận',
  Expired: 'Hết hạn',
  Revoked: 'Đã thu hồi',
}

export function InvitationManagementPanel({
  invitations,
  totalCount,
  page,
  pageSize,
  isLoading,
  isError,
  isFetching,
  resendingId,
  onPageChange,
  onRefresh,
  onResend,
  onRevoke,
}: InvitationManagementPanelProps) {
  return (
    <section className="bg-card min-w-0 overflow-hidden border" aria-labelledby="invitations-title">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b px-3 py-3 sm:px-4">
        <div>
          <h2 id="invitations-title" className="text-sm font-semibold">
            Danh sách lời mời
          </h2>
          <p className="text-muted-foreground text-xs">{totalCount} lời mời</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={isFetching} onClick={onRefresh}>
          <RefreshCw className={isFetching ? 'animate-spin' : undefined} aria-hidden="true" />
          Làm mới
        </Button>
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-4 text-center">
          <p className="text-sm font-medium">Không thể tải danh sách lời mời</p>
          <Button type="button" variant="outline" onClick={onRefresh}>
            Thử lại
          </Button>
        </div>
      ) : invitations.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-4 text-center">
          <Mail className="text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">Chưa có lời mời nào</p>
        </div>
      ) : (
        <>
          <ul className="divide-y">
            {invitations.map((invitation) => {
              const needsWarehouse =
                !invitation.warehouseId &&
                (invitation.status === 'Pending' || invitation.status === 'Expired')
              const canResend =
                !needsWarehouse &&
                (invitation.status === 'Pending' || invitation.status === 'Expired')
              const canRevoke = invitation.status === 'Pending'
              return (
                <li key={invitation.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{invitation.email}</p>
                    <p className="text-muted-foreground text-xs">{invitation.role}</p>
                    {needsWarehouse && (
                      <p className="text-destructive mt-1 text-xs">
                        {canRevoke
                          ? 'Lời mời cũ thiếu kho. Cần thu hồi và gửi lời mời mới.'
                          : 'Lời mời cũ thiếu kho. Cần gửi lời mời mới.'}
                      </p>
                    )}
                  </div>
                  <Badge variant={invitation.status === 'Pending' ? 'default' : 'outline'}>
                    {STATUS_LABELS[invitation.status] ?? invitation.status}
                  </Badge>
                  {canResend ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Gửi lại lời mời ${invitation.email}`}
                      disabled={resendingId === invitation.id}
                      onClick={() => onResend(invitation)}
                    >
                      {resendingId === invitation.id ? (
                        <LoaderCircle className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Send aria-hidden="true" />
                      )}
                    </Button>
                  ) : null}
                  {canRevoke ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Thu hồi lời mời ${invitation.email}`}
                      onClick={() => onRevoke(invitation)}
                    >
                      <Trash2 className="text-destructive" aria-hidden="true" />
                    </Button>
                  ) : null}
                </li>
              )
            })}
          </ul>
          <StaffDirectoryPagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={onPageChange}
          />
        </>
      )}
    </section>
  )
}
