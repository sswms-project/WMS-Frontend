import { useState } from 'react'
import { CheckCircle2, CircleDashed, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Field, FieldLabel } from '@/components/ui/field'
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
import type {
  ProductImportColumn,
  ProductImportField,
  ProductImportSheet,
  ProductImportSheetOptions,
} from '../../types/product-import.types'

export function ProductImportColumnTable({
  kind,
  fields,
  columns,
  options,
  samples,
  error,
  onColumnChange,
}: {
  readonly kind: 'main' | 'conversions'
  readonly fields: readonly ProductImportField[]
  readonly columns: readonly ProductImportColumn[]
  readonly options: ProductImportSheetOptions
  readonly samples: ProductImportSheet['sampleRows']
  readonly error?: string
  readonly onColumnChange: (field: string, column: string) => void
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const normalized = search.trim().toLocaleLowerCase('vi')
  const mapped = new Set(options.columnMapping.map((item) => item.columnIndex))
  const ignored = columns.filter((column) => !mapped.has(column.columnIndex))
  const visible = fields.filter((field) => {
    const index = options.columnMapping.find((item) => item.field === field.field)?.columnIndex
    const column = columns.find((item) => item.columnIndex === index)
    return (
      Boolean(error) ||
      ((filter === 'all' || Boolean(column) === (filter === 'mapped')) &&
        `${field.displayName} ${field.field} ${column?.header ?? ''}`
          .toLocaleLowerCase('vi')
          .includes(normalized))
    )
  })
  return (
    <>
      <div className="flex flex-wrap items-end gap-2">
        <Field className="min-w-0 flex-1 sm:max-w-80">
          <FieldLabel htmlFor={`import-${kind}-search`} className="sr-only">
            Tìm trường {kind === 'main' ? 'hàng hóa' : 'quy đổi'}
          </FieldLabel>
          <Input
            id={`import-${kind}-search`}
            placeholder="Tìm trường hoặc tên cột…"
            value={error ? '' : search}
            disabled={Boolean(error)}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Field>
        <NativeSelect
          aria-label={`Lọc cột ${kind === 'main' ? 'hàng hóa' : 'quy đổi'}`}
          value={error ? 'all' : filter}
          disabled={Boolean(error)}
          onChange={(event) => setFilter(event.target.value)}
        >
          <NativeSelectOption value="all">Tất cả</NativeSelectOption>
          <NativeSelectOption value="mapped">Đã ghép</NativeSelectOption>
          <NativeSelectOption value="unmapped">Chưa ghép</NativeSelectOption>
        </NativeSelect>
      </div>
      {error ? (
        <p className="text-muted-foreground text-xs">
          Đang hiển thị tất cả trường để sửa lỗi ghép cột. Bộ lọc sẽ dùng lại khi cấu hình hợp lệ.
        </p>
      ) : null}
      <Table aria-label={`Ghép cột ${kind === 'main' ? 'hàng hóa' : 'quy đổi'}`}>
        <TableHeader>
          <TableRow>
            <TableHead>Thông tin Kovia</TableHead>
            <TableHead>Cột trong tệp</TableHead>
            <TableHead>Dữ liệu mẫu</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!visible.length ? (
            <TableRow>
              <TableCell colSpan={4} className="h-16 text-center">
                Không có trường phù hợp.
              </TableCell>
            </TableRow>
          ) : (
            visible.map((field) => {
              const index = options.columnMapping.find(
                (item) => item.field === field.field
              )?.columnIndex
              const column = columns.find((item) => item.columnIndex === index)
              const ambiguous =
                column &&
                options.columnMapping.filter((item) => item.columnIndex === index).length > 1
              const invalid = Boolean(error && (ambiguous || (field.isRequired && !column)))
              const values = column
                ? samples
                    .filter((sample) => sample.rowNumber > options.headerRowNumber)
                    .slice(0, 2)
                    .map((sample) => sample.values[column.columnIndex] ?? '—')
                : []
              const id = `import-${kind}-${field.field}`
              return (
                <TableRow key={field.field}>
                  <TableCell className="w-64 max-w-64 min-w-48 wrap-anywhere whitespace-normal">
                    <FieldLabel htmlFor={id}>
                      {field.displayName}
                      {field.isRequired ? ' *' : ''}
                    </FieldLabel>
                    <p id={`${id}-help`} className="text-muted-foreground mt-1 text-xs">
                      {field.description}
                      {field.defaultValue ? ` Mặc định: ${field.defaultValue}.` : ''}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-72 min-w-56">
                    <NativeSelect
                      className="w-full"
                      id={id}
                      value={index ?? ''}
                      aria-required={field.isRequired}
                      aria-invalid={invalid}
                      aria-describedby={`${id}-help${invalid ? ` import-${kind}-error` : ''}`}
                      onChange={(event) => onColumnChange(field.field, event.target.value)}
                    >
                      <NativeSelectOption value="">
                        {field.isRequired ? 'Chọn cột bắt buộc' : 'Không ghép'}
                      </NativeSelectOption>
                      {columns.map((item) => (
                        <NativeSelectOption key={item.columnIndex} value={item.columnIndex}>
                          {item.letter} — {item.header || 'Không có tên'}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </TableCell>
                  <TableCell className="w-64 max-w-64 min-w-40 wrap-anywhere whitespace-normal">
                    {values.length ? (
                      <details>
                        <summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2">
                          <span className="line-clamp-2">{values.join(' · ')}</span>
                          <span className="text-muted-foreground text-xs">Xem đầy đủ</span>
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap">{values.join('\n')}</p>
                      </details>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={ambiguous ? 'destructive' : column ? 'default' : 'outline'}>
                      {ambiguous ? (
                        <TriangleAlert aria-hidden="true" />
                      ) : column ? (
                        <CheckCircle2 aria-hidden="true" />
                      ) : (
                        <CircleDashed aria-hidden="true" />
                      )}
                      {ambiguous ? 'Mơ hồ: trùng cột' : column ? 'Đã ghép' : 'Chưa ghép'}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      {ignored.length ? (
        <details className="text-muted-foreground text-xs">
          <summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2">
            {ignored.length} cột sẽ bỏ qua
          </summary>
          <ul className="mt-2 flex flex-col gap-1 break-words">
            {ignored.map((column) => (
              <li key={column.columnIndex}>
                {column.letter} — {column.header || 'Không có tên'}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  )
}
