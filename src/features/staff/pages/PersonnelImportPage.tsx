'use client'

import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  RefreshCw,
  Upload,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiErrorCode, getApiErrorMessage } from '@/lib/api-error'
import { APP_ROUTES } from '@/routes/app-routes'
import {
  usePersonnelImportCancelMutation,
  usePersonnelImportCommitMutation,
  usePersonnelImportPreviewMutation,
  usePersonnelImportQuery,
  usePersonnelTemplateMutation,
} from '../hooks/use-personnel-import'

const maxFileBytes = 5 * 1024 * 1024
const rowsPerPage = 50
const deliveryLabels: Record<string, string> = {
  Queued: 'Đang chờ gửi',
  Processing: 'Đang gửi',
  Sent: 'Đã gửi',
  Failed: 'Gửi thất bại',
  Superseded: 'Đã thay thế',
}

export function PersonnelImportPage({
  initialImportId = '',
}: {
  readonly initialImportId?: string
}) {
  const router = useRouter()
  const [importId, setImportId] = useState(initialImportId)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Valid' | 'Warning' | 'Invalid'>('All')
  const [page, setPage] = useState(1)
  const previewMutation = usePersonnelImportPreviewMutation()
  const importQuery = usePersonnelImportQuery(importId)
  const commitMutation = usePersonnelImportCommitMutation()
  const cancelMutation = usePersonnelImportCancelMutation()
  const templateMutation = usePersonnelTemplateMutation()
  const details = importQuery.data
  const preview = details?.preview
  const validRows = useMemo(
    () => preview?.rows.filter((row) => row.status === 'Valid').map((row) => row.rowNumber) ?? [],
    [preview]
  )
  const filteredRows = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()
    return (
      preview?.rows.filter(
        (row) =>
          (statusFilter === 'All' ||
            (statusFilter === 'Warning' ? row.warnings.length > 0 : row.status === statusFilter)) &&
          (!normalizedSearch ||
            row.fullName.toLowerCase().includes(normalizedSearch) ||
            row.email.toLowerCase().includes(normalizedSearch))
      ) ?? []
    )
  }, [preview, searchText, statusFilter])
  const visibleRows = filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const visibleValidRows = visibleRows
    .filter((row) => row.status === 'Valid')
    .map((row) => row.rowNumber)
  const areAllVisibleValidRowsSelected =
    visibleValidRows.length > 0 &&
    visibleValidRows.every((rowNumber) => selectedRows.includes(rowNumber))

  async function uploadFile(file?: File) {
    if (!file || previewMutation.isPending) return
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'xlsx'].includes(extension ?? '') || file.size > maxFileBytes) {
      toast.error('Chỉ chấp nhận CSV/XLSX tối đa 5 MiB.')
      return
    }
    try {
      const response = await previewMutation.mutateAsync(file)
      setSelectedRows([])
      setSearchText('')
      setStatusFilter('All')
      setPage(1)
      setImportId(response.data)
      router.replace(`${APP_ROUTES.staffImport}?importId=${response.data}` as Route)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể đọc tệp nhân sự.'))
    }
  }

  async function commit() {
    if (!preview || selectedRows.length === 0 || commitMutation.isPending) return
    try {
      await commitMutation.mutateAsync({
        importId: preview.importId,
        selectedRowNumbers: selectedRows,
        rowVersion: preview.rowVersion,
      })
      toast.success(`Đã tạo ${selectedRows.length} lời mời và đưa email vào hàng đợi.`)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Dữ liệu đã thay đổi. Hãy tải lại bản xem trước.')
      if (getApiErrorCode(error) === 'IMPORT_PREVIEW_STALE') {
        setSelectedRows([])
        setPage(1)
        await importQuery.refetch()
        toast.error(
          'Dữ liệu đã thay đổi. Bản xem trước đã được tải lại; vui lòng chọn lại các dòng hợp lệ.'
        )
      } else {
        toast.error(message)
      }
    }
  }

  async function cancel() {
    if (!importId || cancelMutation.isPending) return
    try {
      await cancelMutation.mutateAsync(importId)
      setImportId('')
      setSelectedRows([])
      setSearchText('')
      setStatusFilter('All')
      setPage(1)
      router.replace(APP_ROUTES.staffImport)
      toast.success('Đã hủy phiên nhập nhân sự.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể hủy phiên nhập.'))
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] min-w-0 flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href={APP_ROUTES.staff} aria-label="Quay lại danh bạ">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <p className="text-primary text-xs font-medium">Tổ chức và nhân sự</p>
            <h1 className="text-xl font-semibold">Nhập danh sách nhân sự</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Kiểm tra dữ liệu trước khi tạo lời mời; tệp không được chứa mật khẩu.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={templateMutation.isPending}
            onClick={() => templateMutation.mutate('xlsx')}
          >
            <Download aria-hidden="true" />
            Mẫu XLSX
          </Button>
          <Button
            variant="outline"
            disabled={templateMutation.isPending}
            onClick={() => templateMutation.mutate('csv')}
          >
            <Download aria-hidden="true" />
            Mẫu CSV
          </Button>
        </div>
      </header>

      {!importId ? (
        <Card>
          <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
              <FileSpreadsheet aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold">Chọn tệp nhân sự</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                CSV hoặc XLSX theo mẫu, tối đa 500 dòng và 5 MiB.
              </p>
            </div>
            <Button asChild disabled={previewMutation.isPending}>
              <label htmlFor="personnel-import-file" className="cursor-pointer">
                {previewMutation.isPending ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Upload aria-hidden="true" />
                )}
                Tải tệp lên
              </label>
            </Button>
            <Input
              id="personnel-import-file"
              type="file"
              className="sr-only"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => {
                void uploadFile(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </CardContent>
        </Card>
      ) : importQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-80" />
        </div>
      ) : importQuery.isError || !preview ? (
        <Alert variant="destructive">
          <AlertTitle>Không thể tải bản xem trước</AlertTitle>
          <AlertDescription className="mt-2 flex items-center gap-2">
            {importQuery.error?.message}
            <Button variant="outline" size="sm" onClick={() => void importQuery.refetch()}>
              <RefreshCw aria-hidden="true" />
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : details.commit ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="text-primary" aria-hidden="true" />
              Đã hoàn tất nhập nhân sự
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Đã tạo <strong>{details.commit.createdCount}</strong> lời mời; bỏ qua{' '}
              {details.commit.skippedCount} dòng.
            </p>
            <ResultTable results={details.commit.results} />
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={APP_ROUTES.staff}>Xem danh sách lời mời</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => exportResults(details.commit?.results ?? [])}
              >
                <Download aria-hidden="true" />
                Xuất kết quả CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Tổng số dòng" value={preview.summary.total} />
            <SummaryCard label="Hợp lệ" value={preview.summary.valid} tone="success" />
            <SummaryCard label="Cảnh báo" value={preview.summary.warning} tone="warning" />
            <SummaryCard label="Không hợp lệ" value={preview.summary.invalid} tone="danger" />
          </section>
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle className="text-base">Bản xem trước</CardTitle>
                  <p className="text-muted-foreground mt-1 text-xs" aria-live="polite">
                    {preview.fileName} · đã chọn {selectedRows.length}/{validRows.length} dòng hợp
                    lệ
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    aria-label="Tìm trong bản xem trước"
                    value={searchText}
                    placeholder="Tìm tên hoặc email"
                    onChange={(event) => {
                      setSearchText(event.target.value)
                      setPage(1)
                    }}
                  />
                  <NativeSelect
                    aria-label="Lọc trạng thái"
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value as 'All' | 'Valid' | 'Warning' | 'Invalid')
                      setPage(1)
                    }}
                  >
                    <NativeSelectOption value="All">Tất cả</NativeSelectOption>
                    <NativeSelectOption value="Valid">Hợp lệ</NativeSelectOption>
                    <NativeSelectOption value="Warning">Cảnh báo</NativeSelectOption>
                    <NativeSelectOption value="Invalid">Không hợp lệ</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          aria-label="Chọn tất cả dòng hợp lệ"
                          checked={areAllVisibleValidRowsSelected}
                          onCheckedChange={(checked) =>
                            setSelectedRows((current) =>
                              checked
                                ? [...new Set([...current, ...visibleValidRows])]
                                : current.filter((value) => !visibleValidRows.includes(value))
                            )
                          }
                        />
                      </TableHead>
                      <TableHead>Dòng</TableHead>
                      <TableHead>Nhân sự</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Kho</TableHead>
                      <TableHead>Kết quả</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-muted-foreground h-24 text-center">
                          Không có dòng nào phù hợp bộ lọc.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map((row) => (
                        <TableRow key={row.rowNumber}>
                          <TableCell>
                            <Checkbox
                              aria-label={`Chọn dòng ${row.rowNumber}`}
                              disabled={row.status !== 'Valid'}
                              checked={selectedRows.includes(row.rowNumber)}
                              onCheckedChange={(checked) =>
                                setSelectedRows((current) =>
                                  checked
                                    ? [...new Set([...current, row.rowNumber])]
                                    : current.filter((value) => value !== row.rowNumber)
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>{row.rowNumber}</TableCell>
                          <TableCell>
                            <p className="font-medium">{row.fullName}</p>
                            <p className="text-muted-foreground text-xs">{row.email}</p>
                          </TableCell>
                          <TableCell>{row.roleCode}</TableCell>
                          <TableCell className="min-w-52">
                            {row.resolvedWarehouses
                              .map((warehouse) => warehouse.warehouseCode)
                              .join(', ') || '—'}
                          </TableCell>
                          <TableCell className="min-w-64">
                            <Badge variant={row.status === 'Valid' ? 'default' : 'destructive'}>
                              {row.status === 'Valid' ? 'Hợp lệ' : 'Không hợp lệ'}
                            </Badge>
                            {[...row.errors, ...row.warnings].map((issue) => (
                              <p
                                key={`${issue.code}-${issue.field}`}
                                className="text-muted-foreground mt-1 text-xs"
                              >
                                {issue.message}
                              </p>
                            ))}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredRows.length > rowsPerPage && (
                <div className="flex items-center justify-end gap-2 border-t p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    Trang trước
                  </Button>
                  <span className="text-muted-foreground text-xs">
                    {page} / {Math.ceil(filteredRows.length / rowsPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(filteredRows.length / rowsPerPage)}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={cancelMutation.isPending || commitMutation.isPending}
              onClick={() => void cancel()}
            >
              Hủy phiên nhập
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={selectedRows.length === 0 || commitMutation.isPending}>
                  {commitMutation.isPending && (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  )}
                  Tạo {selectedRows.length} lời mời
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận tạo lời mời?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hệ thống sẽ tạo lời mời cho các dòng đã chọn và xếp email vào hàng đợi. Không có
                    tài khoản hay mật khẩu nào được tạo trước.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Quay lại kiểm tra</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void commit()}>Xác nhận tạo</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  readonly label: string
  readonly value: number
  readonly tone?: 'success' | 'warning' | 'danger'
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p
          className={
            tone === 'danger'
              ? 'text-destructive mt-1 text-2xl font-semibold'
              : tone === 'success'
                ? 'text-primary mt-1 text-2xl font-semibold'
                : 'mt-1 text-2xl font-semibold'
          }
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function ResultTable({
  results,
}: {
  readonly results: readonly { rowNumber: number; email: string; deliveryStatus: string }[]
}) {
  return (
    <div className="overflow-x-auto border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dòng</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Gửi email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((row) => (
            <TableRow key={row.rowNumber}>
              <TableCell>{row.rowNumber}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {deliveryLabels[row.deliveryStatus] ?? row.deliveryStatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function exportResults(
  results: readonly { rowNumber: number; email: string; deliveryStatus: string }[]
) {
  const csv = personnelImportResultsCsv(results)
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'kovia-personnel-import-results.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}

export function personnelImportResultsCsv(
  results: readonly { rowNumber: number; email: string; deliveryStatus: string }[]
) {
  const escape = (value: string | number) => {
    const text = String(value)
    const spreadsheetSafe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
    return `"${spreadsheetSafe.replaceAll('"', '""')}"`
  }
  return [
    'RowNumber,Email,DeliveryStatus',
    ...results.map((row) => [row.rowNumber, row.email, row.deliveryStatus].map(escape).join(',')),
  ].join('\r\n')
}
