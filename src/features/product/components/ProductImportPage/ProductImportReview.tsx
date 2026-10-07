import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { OperationalPagination } from '@/components/operations/OperationalPagination'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProductImportPreview } from '../../types/product-import.types'
import {
  importSelectionState,
  isValidProductImportRow,
  selectedProductImportRows,
  toggleImportSelection,
} from '../../utils/product-import'

export interface ProductImportReviewFilters {
  search: string
  status: 'all' | 'valid' | 'invalid'
  page: number
  pageSize: number
}

export function ProductImportReview({
  preview,
  selected,
  pending,
  onSelectionChange,
  view,
  onViewChange,
}: {
  readonly preview: ProductImportPreview
  readonly selected: readonly number[]
  readonly pending: boolean
  readonly onSelectionChange: (selected: number[]) => void
  readonly view: ProductImportReviewFilters
  readonly onViewChange: (view: ProductImportReviewFilters) => void
}) {
  const { search, status, page, pageSize } = view
  const valid = preview.rows.filter(isValidProductImportRow).map((row) => row.rowNumber)
  const normalized = search.trim().toLocaleLowerCase('vi')
  const filtered = preview.rows.filter(
    (row) =>
      (status === 'all' || isValidProductImportRow(row) === (status === 'valid')) &&
      `${row.sku} ${row.productName}`.toLocaleLowerCase('vi').includes(normalized)
  )
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const visibleValid = visible.filter(isValidProductImportRow).map((row) => row.rowNumber)
  const blocked = pending || preview.fileErrors.length > 0 || preview.schemaVersion !== 1
  return (
    <>
      {[...preview.fileErrors, ...preview.warnings].map((issue, index) => (
        <Alert
          key={`${issue.code}:${index}`}
          variant={preview.fileErrors.includes(issue) ? 'destructive' : 'default'}
        >
          <AlertTitle>
            {preview.fileErrors.includes(issue) ? 'Không thể nhập tệp' : 'Lưu ý trước khi nhập'}
          </AlertTitle>
          <AlertDescription>{issue.message}</AlertDescription>
        </Alert>
      ))}
      <OperationalListPanel aria-label="Bản xem trước vật tư hàng hóa">
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b p-3">
          <p className="text-sm" aria-live="polite">
            Đã chọn {selectedProductImportRows(preview, selected).length} sản phẩm hợp lệ ·{' '}
            {valid.length} hợp lệ · {preview.rows.length - valid.length} lỗi
          </p>
          <Input
            aria-label="Tìm trong bản xem trước"
            placeholder="Tìm mã, tên hàng…"
            value={search}
            className="sm:w-64"
            onChange={(event) => {
              onViewChange({ ...view, search: event.target.value, page: 1 })
            }}
          />
          <NativeSelect
            aria-label="Lọc trạng thái"
            value={status}
            onChange={(event) => {
              onViewChange({
                ...view,
                status: event.target.value as ProductImportReviewFilters['status'],
                page: 1,
              })
            }}
          >
            <NativeSelectOption value="all">Tất cả</NativeSelectOption>
            <NativeSelectOption value="valid">Hợp lệ</NativeSelectOption>
            <NativeSelectOption value="invalid">Không hợp lệ</NativeSelectOption>
          </NativeSelect>
          <Button
            variant="outline"
            size="sm"
            disabled={blocked || !valid.length}
            onClick={() => onSelectionChange(valid)}
          >
            Chọn toàn bộ sản phẩm hợp lệ của tệp
          </Button>
        </div>
        <Table>
          <TableHeader className="[&_th]:bg-card [&_th]:sticky [&_th]:top-0 [&_th]:z-10">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  aria-label="Chọn dòng hợp lệ trên trang này"
                  checked={importSelectionState(selected, visibleValid)}
                  disabled={blocked || !visibleValid.length}
                  onCheckedChange={(checked) =>
                    onSelectionChange(
                      toggleImportSelection(selected, visibleValid, checked === true)
                    )
                  }
                />
              </TableHead>
              <TableHead>Dòng nguồn</TableHead>
              <TableHead>Mã hàng</TableHead>
              <TableHead>Tên hàng</TableHead>
              <TableHead>ĐVT chính</TableHead>
              <TableHead>Nhóm hàng</TableHead>
              <TableHead>Quy đổi</TableHead>
              <TableHead>Kiểm tra</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!visible.length ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Không có hàng phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow key={row.rowNumber}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Chọn dòng ${row.rowNumber}`}
                      checked={selected.includes(row.rowNumber)}
                      disabled={blocked || !isValidProductImportRow(row)}
                      onCheckedChange={(checked) =>
                        onSelectionChange(
                          toggleImportSelection(selected, [row.rowNumber], checked === true)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {row.sheetName}:{row.rowNumber}
                  </TableCell>
                  <TableCell className="font-mono">{row.sku}</TableCell>
                  <TableCell className="min-w-48 break-words whitespace-normal">
                    {row.productName}
                  </TableCell>
                  <TableCell>{row.unit?.name ?? row.unitValue}</TableCell>
                  <TableCell>{row.category?.name ?? row.categoryValue}</TableCell>
                  <TableCell className="min-w-56">
                    {row.unitConversions.length ? (
                      <details>
                        <summary className="cursor-pointer focus-visible:outline-2">
                          {row.unitConversions.length} đơn vị quy đổi
                        </summary>
                        {row.unitConversions.map((child) => (
                          <div
                            key={`${child.sheetName}:${child.rowNumber}`}
                            className="py-1 text-xs"
                          >
                            <p>
                              1 {child.unit?.name ?? child.unitValue} ={' '}
                              {child.conversionFactorText ?? child.conversionFactor ?? '?'}{' '}
                              {row.unit?.name ?? row.unitValue}
                            </p>
                            <p className="text-muted-foreground">
                              {child.sheetName}:{child.rowNumber}
                            </p>
                            {child.errors.map((issue, index) => (
                              <p key={index} className="text-destructive">
                                {issue.message}
                              </p>
                            ))}
                          </div>
                        ))}
                      </details>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="min-w-64 whitespace-normal">
                    <Badge variant={isValidProductImportRow(row) ? 'default' : 'destructive'}>
                      {isValidProductImportRow(row) ? 'Hợp lệ' : 'Không hợp lệ'}
                    </Badge>
                    {[...row.errors, ...row.warnings].map((issue, index) => (
                      <p key={index} className="mt-1 text-xs">
                        {issue.source
                          ? `${issue.source.sheetName}:${issue.source.rowNumber} — `
                          : ''}
                        {issue.message}
                      </p>
                    ))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <OperationalPagination
          page={page}
          pageSize={pageSize}
          totalCount={filtered.length}
          isPending={pending}
          onPageChange={(page) => onViewChange({ ...view, page })}
          onPageSizeChange={(value) => {
            onViewChange({ ...view, pageSize: value, page: 1 })
          }}
        />
      </OperationalListPanel>
    </>
  )
}
