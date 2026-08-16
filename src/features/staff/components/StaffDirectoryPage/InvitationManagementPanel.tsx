import { MailQuestion, RefreshCw, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { InvitationResponse } from '../../types/invitation.types'
import { InvitationManagementTable } from './InvitationManagementTable'
import { StaffDirectoryPagination } from './StaffDirectoryPagination'

interface InvitationManagementPanelProps {
  readonly invitations: readonly InvitationResponse[]
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
    <section className="bg-card border" aria-labelledby="invitation-management-title">
      <div className="flex min-h-14 items-center justify-between gap-3 border-b px-3 py-3 sm:px-4">
        <div>
          <h2 id="invitation-management-title" className="text-sm font-semibold">
            Lời mời nhân sự
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs" aria-live="polite">
            {totalCount} lời mời
            {isFetching && !isLoading ? ', đang cập nhật' : ''}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 sm:size-8"
          disabled={isFetching}
          aria-label="Làm mới danh sách lời mời"
          onClick={onRefresh}
        >
          <RefreshCw
            className={isFetching ? 'size-4 animate-spin motion-reduce:animate-none' : 'size-4'}
            aria-hidden="true"
          />
        </Button>
      </div>

      {isLoading && (
        <div className="divide-y" aria-label="Đang tải danh sách lời mời">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex h-16 items-center gap-3 px-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="hidden h-4 w-24 sm:block" />
              <Skeleton className="ml-auto h-5 w-20" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
          <MailQuestion className="text-destructive size-10" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Không thể tải danh sách lời mời</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              Kiểm tra quyền truy cập hoặc thử tải lại danh sách.
            </p>
          </div>
          <Button type="button" variant="outline" disabled={isFetching} onClick={onRefresh}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Thử lại
          </Button>
        </div>
      )}

      {!isLoading && !isError && invitations.length === 0 && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="bg-muted flex size-12 items-center justify-center">
            <Send className="text-muted-foreground size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium">Chưa có lời mời nào</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              Các lời mời đã gửi sẽ xuất hiện tại đây để bạn theo dõi và quản lý.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && invitations.length > 0 && (
        <>
          <InvitationManagementTable
            invitations={invitations}
            resendingId={resendingId}
            onResend={onResend}
            onRevoke={onRevoke}
          />
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
