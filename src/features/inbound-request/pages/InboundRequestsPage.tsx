'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'
import { toast } from 'sonner'
import { P } from '@/config/permissionCodes'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { InboundRequestDirectory } from '../components/InboundRequestsPage'
import {
  useDeleteInboundRequestMutation,
  useDeleteInboundRequestsMutation,
  useDuplicateInboundRequestMutation,
  useInboundRequestsQuery,
} from '../hooks/use-inbound-requests'
import type { InboundRequestStatus, InboundRequestSummary } from '../types/inbound-request.types'
import { APP_ROUTES } from '@/routes/app-routes'

type DeleteIntent =
  | { readonly kind: 'single'; readonly item: InboundRequestSummary }
  | { readonly kind: 'many'; readonly ids: readonly string[] }

export default function InboundRequestsPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [status, setStatus] = useState<InboundRequestStatus | ''>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([])
  const [deleteIntent, setDeleteIntent] = useState<DeleteIntent | null>(null)
  const meQuery = useMeQuery()
  const deleteMutation = useDeleteInboundRequestMutation()
  const deleteManyMutation = useDeleteInboundRequestsMutation()
  const duplicateMutation = useDuplicateInboundRequestMutation()
  const debouncedSearchText = useDebouncedValue(searchText, 350)
  const query = useInboundRequestsQuery({
    pageNumber: page,
    pageSize,
    ...(debouncedSearchText ? { searchTerm: debouncedSearchText } : {}),
    ...(status ? { status } : {}),
  })

  function confirmDelete() {
    const intent = deleteIntent
    setDeleteIntent(null)
    if (!intent) return

    if (intent.kind === 'single') {
      deleteMutation.mutate(intent.item.id, {
        onSuccess: () => {
          setSelectedIds((ids) => ids.filter((id) => id !== intent.item.id))
          toast.success('Đã xoá yêu cầu nhập kho.')
        },
        onError: (error) => toast.error(error.message || 'Không thể xoá yêu cầu nhập kho.'),
      })
      return
    }

    deleteManyMutation.mutate(intent.ids, {
      onSuccess: () => {
        setSelectedIds([])
        toast.success('Đã xoá các phiếu nhập kho đã chọn.')
      },
      onError: (error) => toast.error(error.message || 'Không thể xoá các phiếu nhập kho đã chọn.'),
    })
  }

  return (
    <>
      <InboundRequestDirectory
        items={query.data?.items ?? []}
        totalCount={query.data?.totalCount ?? 0}
        page={page}
        pageSize={pageSize}
        searchText={searchText}
        status={status}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        canDelete={meQuery.data?.permissions.includes(P.INBOUND_REQUESTS_DELETE) ?? false}
        canCreate={meQuery.data?.permissions.includes(P.INBOUND_REQUESTS_CREATE) ?? false}
        isDeleting={deleteMutation.isPending}
        isDuplicating={duplicateMutation.isPending}
        selectedIds={selectedIds}
        isDeletingMany={deleteManyMutation.isPending}
        onSearchChange={(value) => {
          setSearchText(value)
          setPage(1)
          setSelectedIds([])
        }}
        onStatusChange={(value) => {
          setStatus(value)
          setPage(1)
          setSelectedIds([])
        }}
        onPageChange={(value) => {
          setPage(value)
          setSelectedIds([])
        }}
        onPageSizeChange={(value) => {
          setPageSize(value)
          setPage(1)
        }}
        onRetry={() => void query.refetch()}
        onSelectionChange={setSelectedIds}
        onDelete={(item) => setDeleteIntent({ kind: 'single', item })}
        onDuplicate={(item) =>
          duplicateMutation.mutate(item.id, {
            onSuccess: (response) => {
              toast.success('Đã sao chép yêu cầu nhập kho thành bản nháp.')
              router.push(APP_ROUTES.inboundRequestDetail(response.data) as Route)
            },
            onError: (error) =>
              toast.error(error.message || 'Không thể sao chép yêu cầu nhập kho.'),
          })
        }
        onDeleteMany={() =>
          selectedIds.length > 0 && setDeleteIntent({ kind: 'many', ids: selectedIds })
        }
      />
      <AlertDialog
        open={deleteIntent !== null}
        onOpenChange={(open) => !open && setDeleteIntent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteIntent?.kind === 'single'
                ? 'Xoá yêu cầu nhập kho?'
                : `Xoá ${deleteIntent?.kind === 'many' ? deleteIntent.ids.length : 0} phiếu nhập kho?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteIntent?.kind === 'single'
                ? `Bạn có chắc muốn xoá yêu cầu ${deleteIntent.item.inboundRequestCode}?`
                : 'Bạn có chắc muốn xoá các phiếu nhập kho nháp đã chọn? Thao tác này không thể hoàn tác.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending || deleteManyMutation.isPending}
              onClick={confirmDelete}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
