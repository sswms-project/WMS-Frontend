'use client'

import { useState } from 'react'
import { Mail, MailPlus, RefreshCw, UserRoundSearch, Users, Warehouse } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { USER_ROLES } from '@/config/roles'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useAuthStore } from '@/stores/auth.store'
import {
  InviteStaffDialog,
  InvitationManagementPanel,
  InvitationRevokeDialog,
  ManagerWarehouseAssignmentDialog,
  StaffDetailsSheet,
  StaffDirectoryPagination,
  StaffDirectoryTable,
  StaffDirectoryToolbar,
  StaffLifecycleDialog,
} from '../components/StaffDirectoryPage'
import {
  useInvitationsQuery,
  useResendInvitationMutation,
  useRevokeInvitationMutation,
} from '../hooks/use-invitations'
import { useAssignmentWarehousesQuery } from '../hooks/use-manager-assignment'
import {
  useDeactivateStaffMutation,
  useReactivateStaffMutation,
  useStaffDetailsQuery,
  useStaffListQuery,
} from '../hooks/use-staff'
import type { InvitationQuery, InvitationResponse } from '../types/invitation.types'
import type { WarehouseAssignmentQuery } from '../types/manager-assignment.types'
import {
  STAFF_DIRECTORY_KINDS,
  type StaffDirectoryKind,
  type StaffLifecycleAction,
  type StaffQuery,
  type StaffResponse,
} from '../types/staff.types'

const pageSize = 10
const warehouseScopeQuery: WarehouseAssignmentQuery = {
  top: 1000,
  skip: 0,
  needTotalCount: true,
}

const STAFF_PAGE_VIEWS = {
  directory: 'directory',
  invitations: 'invitations',
} as const

type StaffPageView = (typeof STAFF_PAGE_VIEWS)[keyof typeof STAFF_PAGE_VIEWS]

interface PendingLifecycleAction {
  readonly person: StaffResponse
  readonly action: StaffLifecycleAction
}

function isStaffDirectoryKind(value: string): value is StaffDirectoryKind {
  return value === STAFF_DIRECTORY_KINDS.managers || value === STAFF_DIRECTORY_KINDS.staff
}

function isStaffPageView(value: string): value is StaffPageView {
  return value === STAFF_PAGE_VIEWS.directory || value === STAFF_PAGE_VIEWS.invitations
}

export function StaffDirectoryPage() {
  const user = useAuthStore((state) => state.user)
  const isTenantOwner = user?.role === USER_ROLES.TenantOwner
  const [kind, setKind] = useState<StaffDirectoryKind>(
    isTenantOwner ? STAFF_DIRECTORY_KINDS.managers : STAFF_DIRECTORY_KINDS.staff
  )
  const [activeView, setActiveView] = useState<StaffPageView>(STAFF_PAGE_VIEWS.directory)
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const [invitationPage, setInvitationPage] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [managerToAssign, setManagerToAssign] = useState<StaffResponse | null>(null)
  const [pendingLifecycleAction, setPendingLifecycleAction] =
    useState<PendingLifecycleAction | null>(null)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [invitationToRevoke, setInvitationToRevoke] = useState<InvitationResponse | null>(null)
  const debouncedSearchText = useDebouncedValue(searchText.trim(), 300)
  const params: StaffQuery = {
    top: pageSize,
    skip: (page - 1) * pageSize,
    needTotalCount: true,
    ...(debouncedSearchText ? { searchText: debouncedSearchText } : {}),
  }
  const invitationParams: InvitationQuery = {
    top: pageSize,
    skip: (invitationPage - 1) * pageSize,
    needTotalCount: true,
  }
  const listQuery = useStaffListQuery(kind, params)
  const people = listQuery.data?.items ?? []
  const warehousesQuery = useAssignmentWarehousesQuery(
    warehouseScopeQuery,
    people.some((person) => person.assignedWarehouseIds.length > 0)
  )
  const invitationsQuery = useInvitationsQuery(
    invitationParams,
    activeView === STAFF_PAGE_VIEWS.invitations
  )
  const detailsQuery = useStaffDetailsQuery(selectedUserId)
  const deactivateMutation = useDeactivateStaffMutation()
  const reactivateMutation = useReactivateStaffMutation()
  const resendInvitationMutation = useResendInvitationMutation()
  const revokeInvitationMutation = useRevokeInvitationMutation()
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

  async function resendInvitation(invitation: InvitationResponse) {
    try {
      await resendInvitationMutation.mutateAsync(invitation.id)
      toast.success(`Đã gửi lại lời mời tới ${invitation.email}.`)
    } catch (error) {
      console.error(error)
      toast.error(
        typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
          ? error.message
          : 'Không thể gửi lại lời mời.'
      )
    }
  }

  async function confirmRevokeInvitation() {
    if (!invitationToRevoke) return
    const shouldReturnToPreviousPage = invitations.length === 1 && invitationPage > 1

    try {
      await revokeInvitationMutation.mutateAsync(invitationToRevoke.id)
      toast.success(`Đã thu hồi lời mời tới ${invitationToRevoke.email}.`)
      setInvitationToRevoke(null)
      if (shouldReturnToPreviousPage) setInvitationPage((currentPage) => currentPage - 1)
    } catch (error) {
      console.error(error)
      toast.error(
        typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
          ? error.message
          : 'Không thể thu hồi lời mời.'
      )
    }
  }

  const invitations = invitationsQuery.data?.items ?? []
  const directoryLabel = kind === STAFF_DIRECTORY_KINDS.managers ? 'quản lý kho' : 'nhân viên kho'

  return (
    <div className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-col gap-4">
      <header className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-start sm:justify-between">
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

      <Tabs
        value={activeView}
        className="min-w-0 flex-col gap-4"
        onValueChange={(value) => isStaffPageView(value) && setActiveView(value)}
      >
        <TabsList variant="line" className="h-10 w-full justify-start border-b p-0">
          <TabsTrigger value={STAFF_PAGE_VIEWS.directory} className="h-10 flex-none px-3">
            <Users className="size-4" aria-hidden="true" />
            Nhân sự
          </TabsTrigger>
          <TabsTrigger value={STAFF_PAGE_VIEWS.invitations} className="h-10 flex-none px-3">
            <Mail className="size-4" aria-hidden="true" />
            Lời mời
          </TabsTrigger>
        </TabsList>

        <TabsContent value={STAFF_PAGE_VIEWS.directory} className="min-w-0">
          <section
            className="bg-card min-w-0 overflow-hidden border"
            aria-labelledby="staff-directory-title"
          >
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

            {people.length > 0 && warehousesQuery.isError && (
              <Alert variant="destructive" className="mx-3 mb-3 sm:mx-4">
                <Warehouse aria-hidden="true" />
                <AlertTitle>Không thể tải phạm vi kho</AlertTitle>
                <AlertDescription className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span>Danh sách nhân sự vẫn khả dụng, nhưng tên kho chưa thể hiển thị.</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    disabled={warehousesQuery.isFetching}
                    onClick={() => void warehousesQuery.refetch()}
                  >
                    <RefreshCw
                      data-icon="inline-start"
                      className={warehousesQuery.isFetching ? 'animate-spin' : undefined}
                      aria-hidden="true"
                    />
                    Thử lại
                  </Button>
                </AlertDescription>
              </Alert>
            )}

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
                  warehouses={warehousesQuery.data?.items ?? []}
                  isWarehouseScopeLoading={warehousesQuery.isLoading}
                  onView={(person) => setSelectedUserId(person.id)}
                  onAssignWarehouse={setManagerToAssign}
                  onLifecycleAction={(person, action) =>
                    setPendingLifecycleAction({ person, action })
                  }
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
        </TabsContent>

        <TabsContent value={STAFF_PAGE_VIEWS.invitations} className="min-w-0">
          <InvitationManagementPanel
            invitations={invitations}
            totalCount={invitationsQuery.data?.totalCount ?? 0}
            page={invitationPage}
            pageSize={pageSize}
            isLoading={invitationsQuery.isLoading}
            isError={invitationsQuery.isError}
            isFetching={invitationsQuery.isFetching}
            resendingId={
              resendInvitationMutation.isPending
                ? (resendInvitationMutation.variables ?? null)
                : null
            }
            onPageChange={setInvitationPage}
            onRefresh={() => void invitationsQuery.refetch()}
            onResend={(invitation) => void resendInvitation(invitation)}
            onRevoke={setInvitationToRevoke}
          />
        </TabsContent>
      </Tabs>

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

      {invitationToRevoke && (
        <InvitationRevokeDialog
          invitation={invitationToRevoke}
          isPending={revokeInvitationMutation.isPending}
          onOpenChange={(open) => !open && setInvitationToRevoke(null)}
          onConfirm={() => void confirmRevokeInvitation()}
        />
      )}

      {managerToAssign && (
        <ManagerWarehouseAssignmentDialog
          manager={managerToAssign}
          onOpenChange={(open) => !open && setManagerToAssign(null)}
        />
      )}
    </div>
  )
}
