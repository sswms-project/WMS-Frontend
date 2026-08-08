'use client'

import { useState } from 'react'
import { MailPlus, RefreshCw, UserRoundSearch, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { USER_ROLES } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import {
  InviteStaffDialog,
  ManagerWarehouseAssignmentDialog,
  StaffDetailsSheet,
  StaffDirectoryPagination,
  StaffDirectoryTable,
  StaffDirectoryToolbar,
  StaffLifecycleDialog,
} from '../components/StaffDirectoryPage'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import {
  useDeactivateStaffMutation,
  useReactivateStaffMutation,
  useStaffDetailsQuery,
  useStaffListQuery,
} from '../hooks/use-staff'
import {
  STAFF_DIRECTORY_KINDS,
  type StaffDirectoryKind,
  type StaffLifecycleAction,
  type StaffQuery,
  type StaffResponse,
} from '../types/staff.types'

const pageSize = 10

interface PendingLifecycleAction {
  readonly person: StaffResponse
  readonly action: StaffLifecycleAction
}

function isStaffDirectoryKind(value: string): value is StaffDirectoryKind {
  return value === STAFF_DIRECTORY_KINDS.managers || value === STAFF_DIRECTORY_KINDS.staff
}

export function StaffDirectoryPage() {
  const user = useAuthStore((state) => state.user)
  const isTenantOwner = user?.role === USER_ROLES.TenantOwner
  const [kind, setKind] = useState<StaffDirectoryKind>(
    isTenantOwner ? STAFF_DIRECTORY_KINDS.managers : STAFF_DIRECTORY_KINDS.staff
  )
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [managerToAssign, setManagerToAssign] = useState<StaffResponse | null>(null)
  const [pendingLifecycleAction, setPendingLifecycleAction] =
    useState<PendingLifecycleAction | null>(null)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const debouncedSearchText = useDebouncedValue(searchText.trim(), 300)
  const params: StaffQuery = {
    top: pageSize,
    skip: (page - 1) * pageSize,
    needTotalCount: true,
    ...(debouncedSearchText ? { searchText: debouncedSearchText } : {}),
  }
  const listQuery = useStaffListQuery(kind, params)
  const detailsQuery = useStaffDetailsQuery(selectedUserId)
  const deactivateMutation = useDeactivateStaffMutation()
  const reactivateMutation = useReactivateStaffMutation()
  const lifecycleMutation =
    pendingLifecycleAction?.action === 'reactivate' ? reactivateMutation : deactivateMutation

  function changeKind(nextKind: StaffDirectoryKind) {
    setKind(nextKind)
    setPage(1)
    setSearchText('')
  }

  function changeSearch(value: string) {
    setSearchText(value)
    setPage(1)
  }

  async function confirmLifecycleAction() {
    if (!pendingLifecycleAction) return
    const { person, action } = pendingLifecycleAction
    const mutation = action === 'deactivate' ? deactivateMutation : reactivateMutation

    try {
      await mutation.mutateAsync(person.id)
      toast.success(
        action === 'deactivate' ? 'Đã vô hiệu hóa tài khoản.' : 'Đã kích hoạt lại tài khoản.'
      )
      setPendingLifecycleAction(null)
    } catch (error) {
      console.error(error)
      toast.error(
        typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
          ? error.message
          : 'Không thể cập nhật trạng thái tài khoản.'
      )
    }
  }

  const people = listQuery.data?.items ?? []
  const directoryLabel = kind === STAFF_DIRECTORY_KINDS.managers ? 'quản lý kho' : 'nhân viên kho'

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-5">
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center">
            <Users className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-primary text-xs font-medium">Tổ chức và nhân sự</p>
            <h1 className="mt-0.5 text-xl font-semibold">Danh bạ nhân sự</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-xs sm:text-sm">
              Tra cứu hồ sơ và quản lý trạng thái tài khoản theo quyền được cấp.
            </p>
          </div>
        </div>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => setIsInviteDialogOpen(true)}
        >
          <MailPlus className="size-4" aria-hidden="true" />
          Mời nhân sự
        </Button>
      </header>

      <section className="bg-card border" aria-labelledby="staff-directory-title">
        <div className="flex min-h-12 flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div>
            <h2 id="staff-directory-title" className="text-sm font-semibold">
              Danh sách {directoryLabel}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {listQuery.data?.totalCount ?? 0} tài khoản
            </p>
          </div>
          {isTenantOwner && (
            <Tabs
              value={kind}
              onValueChange={(value) => isStaffDirectoryKind(value) && changeKind(value)}
            >
              <TabsList>
                <TabsTrigger value={STAFF_DIRECTORY_KINDS.managers}>Quản lý kho</TabsTrigger>
                <TabsTrigger value={STAFF_DIRECTORY_KINDS.staff}>Nhân viên kho</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        <StaffDirectoryToolbar
          searchText={searchText}
          isFetching={listQuery.isFetching}
          onSearchChange={changeSearch}
        />

        {listQuery.isLoading && (
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex h-16 items-center gap-3 px-4">
                <Skeleton className="size-8" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="ml-auto hidden h-4 w-24 sm:block" />
              </div>
            ))}
          </div>
        )}

        {listQuery.isError && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
            <UserRoundSearch className="text-destructive size-10" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Không thể tải danh sách nhân sự</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Bạn không có quyền xem hoặc kết nối đã gián đoạn.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={listQuery.isFetching}
              onClick={() => void listQuery.refetch()}
            >
              <RefreshCw
                className={listQuery.isFetching ? 'size-4 animate-spin' : 'size-4'}
                aria-hidden="true"
              />
              Thử lại
            </Button>
          </div>
        )}

        {!listQuery.isLoading && !listQuery.isError && people.length === 0 && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
            <div className="bg-muted flex size-12 items-center justify-center">
              <UserRoundSearch className="text-muted-foreground size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">Không tìm thấy {directoryLabel}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {debouncedSearchText
                  ? 'Thử tên hoặc email khác.'
                  : 'Danh sách hiện chưa có tài khoản.'}
              </p>
            </div>
            {searchText && (
              <Button type="button" variant="outline" onClick={() => changeSearch('')}>
                Xóa tìm kiếm
              </Button>
            )}
          </div>
        )}

        {people.length > 0 && (
          <>
            <StaffDirectoryTable
              kind={kind}
              people={people}
              onView={(person) => setSelectedUserId(person.id)}
              onAssignWarehouse={setManagerToAssign}
              onLifecycleAction={(person, action) => setPendingLifecycleAction({ person, action })}
            />
            <StaffDirectoryPagination
              page={page}
              pageSize={pageSize}
              totalCount={listQuery.data?.totalCount ?? 0}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      <StaffDetailsSheet
        open={Boolean(selectedUserId)}
        person={detailsQuery.data}
        isLoading={detailsQuery.isLoading}
        isError={detailsQuery.isError}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      />

      {pendingLifecycleAction && (
        <StaffLifecycleDialog
          person={pendingLifecycleAction.person}
          action={pendingLifecycleAction.action}
          isPending={lifecycleMutation.isPending}
          onOpenChange={(open) => !open && setPendingLifecycleAction(null)}
          onConfirm={() => void confirmLifecycleAction()}
        />
      )}

      <InviteStaffDialog
        open={isInviteDialogOpen}
        canInviteManagers={isTenantOwner}
        onOpenChange={setIsInviteDialogOpen}
      />

      {managerToAssign && (
        <ManagerWarehouseAssignmentDialog
          manager={managerToAssign}
          onOpenChange={(open) => !open && setManagerToAssign(null)}
        />
      )}
    </div>
  )
}
