import { LoaderCircle, Mail, MailSearch, RefreshCw, Send, Trash2 } from 'lucide-react'
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

function statusLabel(status: string) {
  switch (status) {
    case 'Pending':
      return 'Chờ xác nhận'
    case 'Accepted':
      return 'Đã chấp nhận'
    case 'Expired':
      return 'Hết hạn'
    case 'Revoked':
      return 'Đã thu hồi'
    default:
      return status
  }
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'Pending':
      return 'default'
    case 'Accepted':
      return 'secondary'
    case 'Expired':
    case 'Revoked':
      return 'destructive'
    default:
      return 'outline'
  }
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
      <div className="flex min-h-12 flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div>
          <h2 id="invitations-title" className="text-sm font-semibold">
            Danh sách lời mời
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">{totalCount} lời mời</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={isFetching} onClick={onRefresh}>
          <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} aria-hidden="true" />
          Làm mới
        </Button>
      </div>

      {isLoading && (
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex h-16 items-center gap-3 px-4">
              <Skeleton className="size-8" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
          <MailSearch className="text-destructive size-10" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Không thể tải danh sách lời mời</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Kết nối gián đoạn hoặc thiếu quyền.
            </p>
          </div>
          <Button type="button" variant="outline" disabled={isFetching} onClick={onRefresh}>
            <RefreshCw
              className={isFetching ? 'size-4 animate-spin' : 'size-4'}
              aria-hidden="true"
            />
            Thử lại
          </Button>
        </div>
      )}

      {!isLoading && !isError && invitations.length === 0 && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="bg-muted flex size-12 items-center justify-center">
            <Mail className="text-muted-foreground size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium">Chưa có lời mời nào</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Dùng nút &quot;Mời nhân sự&quot; để gửi lời mời.
            </p>
          </div>
        </div>
      )}

      {invitations.length > 0 && (
        <>
          <ul className="divide-y">
            {invitations.map((invitation) => {
              const isResending = resendingId === invitation.id
              const canResend = invitation.status === 'Pending' || invitation.status === 'Expired'
              const canRevoke = invitation.status === 'Pending'

              return (
                <li
                  key={invitation.id}
                  className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{invitation.email}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{invitation.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(invitation.status)}>
                      {statusLabel(invitation.status)}
                    </Badge>
                    {canResend && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={isResending}
                        aria-label={`Gửi lại lời mời tới ${invitation.email}`}
                        onClick={() => onResend(invitation)}
                      >
                        {isResending ? (
                          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Send className="size-4" aria-hidden="true" />
                        )}
                      </Button>
                    )}
                    {canRevoke && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Thu hồi lời mời tới ${invitation.email}`}
                        onClick={() => onRevoke(invitation)}
                      >
                        <Trash2 className="text-destructive size-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
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
