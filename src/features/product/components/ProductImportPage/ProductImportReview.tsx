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
  onExport,
}: {
  readonly preview: ProductImportPreview
  readonly selected: readonly number[]
  readonly pending: boolean
  readonly onSelectionChange: (selected: number[]) => void
  readonly view: ProductImportReviewFilters
  readonly onViewChange: (view: ProductImportReviewFilters) => void
  readonly onExport: () => void
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
      {preview.fileErrors.length || preview.warnings.length ? (
        <Alert
          id="product-import-file-issues"
          className="shrink-0"
          variant={preview.fileErrors.length ? 'destructive' : 'default'}
        >
          <AlertTitle>
            {preview.fileErrors.length ? 'Không thể nhập tệp' : 'Lưu ý trước khi nhập'}
          </AlertTitle>
          <AlertDescription className="min-w-0">
            <details>
              <summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2">
                {preview.fileErrors.length} lỗi tệp · {preview.warnings.length} cảnh báo — xem chi
                tiết
              </summary>
              <ul className="mt-2 flex max-h-32 flex-col gap-2 overflow-auto wrap-anywhere whitespace-normal">
                {[...preview.fileErrors, ...preview.warnings].map((issue, index) => (
                  <li key={index}>
                    {issue.source ? `${issue.source.sheetName}:${issue.source.rowNumber} — ` : ''}
                    {issue.message}
                  </li>
                ))}
              </ul>
            </details>
          </AlertDescription>
        </Alert>
      ) : null}
      <OperationalListPanel aria-label="Bản xem trước vật tư hàng hóa">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b p-3">
          <p className="basis-full text-sm tabular-nums xl:basis-auto" aria-live="polite">
            Đã chọn {selectedProductImportRows(preview, selected).length} sản phẩm hợp lệ ·{' '}
            {valid.length} hợp lệ · {preview.rows.length - valid.length} lỗi
          </p>
          <Input
            aria-label="Tìm trong bản xem trước"
            placeholder="Tìm mã, tên hàng…"
            value={search}
            className="min-w-0 flex-1 basis-40 sm:w-64 sm:flex-none sm:basis-auto"
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
            aria-label="Chọn toàn bộ sản phẩm hợp lệ của tệp"
            disabled={blocked || !valid.length}
            onClick={() => onSelectionChange(valid)}
          >
            <span className="sm:hidden">Chọn tất cả hợp lệ</span>
            <span className="hidden sm:inline">Chọn toàn bộ sản phẩm hợp lệ của tệp</span>
          </Button>
          <Button variant="outline" size="sm" aria-label="Xuất báo cáo toàn tệp" onClick={onExport}>
            <span className="sm:hidden">Xuất báo cáo</span>
            <span className="hidden sm:inline">Xuất báo cáo toàn tệp</span>
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
              <TableHead>Kiểm tra / Chi tiết lỗi</TableHead>
              <TableHead>Mã hàng</TableHead>
              <TableHead>Tên hàng</TableHead>
              <TableHead>ĐVT chính</TableHead>
              <TableHead>Nhóm hàng</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Theo dõi lô</TableHead>
              <TableHead>Số ngày sử dụng</TableHead>
              <TableHead>Quy đổi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!visible.length ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  Không có hàng phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow key={row.rowNumber}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Chọn dòng ${row.rowNumber}`}
                      aria-describedby={
                        preview.fileErrors.length
                          ? 'product-import-file-issues'
                          : !isValidProductImportRow(row)
                            ? `import-row-${row.rowNumber}-errors`
                            : undefined
                      }
                      checked={selected.includes(row.rowNumber)}
                      disabled={blocked || !isValidProductImportRow(row)}
                      onCheckedChange={(checked) =>
                        onSelectionChange(
                          toggleImportSelection(selected, [row.rowNumber], checked === true)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="max-w-48 wrap-anywhere whitespace-normal">
                    {row.sheetName}:{row.rowNumber}
                  </TableCell>
                  <TableCell className="max-w-96 min-w-48 wrap-anywhere whitespace-normal">
                    <Badge variant={isValidProductImportRow(row) ? 'default' : 'destructive'}>
                      {isValidProductImportRow(row) ? 'Hợp lệ' : 'Không hợp lệ'}
                    </Badge>
                    {!isValidProductImportRow(row) || row.warnings.length ? (
                      <details id={`import-row-${row.rowNumber}-errors`} className="mt-1 text-xs">
                        <summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2">
                          {row.errors.length +
                            row.unitConversions.reduce(
                              (count, child) => count + child.errors.length,
                              0
                            )}{' '}
                          lỗi · {row.warnings.length} cảnh báo. Không thể chọn dòng có lỗi.
                        </summary>
                        <div className="max-h-48 overflow-auto">
                          {[
                            ...row.errors,
                            ...row.unitConversions.flatMap((child) => child.errors),
                            ...row.warnings,
                          ].map((issue, index) => (
                            <p key={index} className="mt-1">
                              {issue.source
                                ? `${issue.source.sheetName}:${issue.source.rowNumber} — `
                                : ''}
                              {issue.message}
                            </p>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-48 font-mono wrap-anywhere whitespace-normal">
                    {row.sku}
                  </TableCell>
                  <TableCell className="max-w-80 min-w-48 wrap-anywhere whitespace-normal">
                    {row.productName}
                  </TableCell>
                  <TableCell className="max-w-48 wrap-anywhere whitespace-normal">
                    {row.unit ? `${row.unit.code} — ${row.unit.name}` : row.unitValue}
                  </TableCell>
                  <TableCell className="max-w-48 wrap-anywhere whitespace-normal">
                    {row.category
                      ? `${row.category.code} — ${row.category.name}`
                      : row.categoryValue}
                  </TableCell>
                  <TableCell className="max-w-64 min-w-40 wrap-anywhere whitespace-normal">
                    {row.description || '—'}
                  </TableCell>
                  <TableCell>{row.isLotTracked ? 'Có' : 'Không'}</TableCell>
                  <TableCell>{row.shelfLifeDays ?? '—'}</TableCell>
                  <TableCell className="max-w-80 min-w-56 wrap-anywhere whitespace-normal">
                    {row.unitConversions.length ? (
                      <details>
                        <summary className="cursor-pointer focus-visible:outline-2">
                          {row.unitConversions.length} đơn vị quy đổi
                        </summary>
                        <div className="max-h-48 overflow-auto">
                          {row.unitConversions.map((child) => (
                            <div
                              key={`${child.sheetName}:${child.rowNumber}`}
                              className="py-1 text-xs"
                            >
                              <p>
                                1{' '}
                                {child.unit
                                  ? `${child.unit.code} — ${child.unit.name}`
                                  : child.unitValue}{' '}
                                = {child.conversionFactorText ?? child.conversionFactor ?? '?'}{' '}
                                {row.unit ? `${row.unit.code} — ${row.unit.name}` : row.unitValue}
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
                        </div>
                      </details>
                    ) : (
                      '—'
                    )}
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
