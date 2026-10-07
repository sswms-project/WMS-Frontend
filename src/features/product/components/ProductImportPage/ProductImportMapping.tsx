import type { UseFormReturn } from 'react-hook-form'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProductImportFormValues } from '../../schemas/product-import.schema'
import type {
  ProductImportInspect,
  ProductImportSheetOptions,
} from '../../types/product-import.types'
import { suggestedImportSheet } from '../../utils/product-import'

interface ProductImportMappingProps {
  readonly inspect: ProductImportInspect
  readonly form: UseFormReturn<ProductImportFormValues>
  readonly pending: boolean
  readonly onChange: () => void
  readonly onPreview: () => void
}

export function ProductImportMapping({
  inspect,
  form,
  pending,
  onChange,
  onPreview,
}: ProductImportMappingProps) {
  const values = form.watch()
  function changeSheet(kind: 'main' | 'conversions', id: string) {
    onChange()
    const sheet = inspect.sheets.find((item) => item.sheetId === id)
    form.setValue(
      kind,
      sheet
        ? suggestedImportSheet(sheet, kind)
        : kind === 'conversions'
          ? null
          : { sheetId: '', headerRowNumber: 1, columnMapping: [] },
      { shouldDirty: true }
    )
  }
  function changeHeader(kind: 'main' | 'conversions', value: number) {
    onChange()
    const options = values[kind]
    if (!options) return
    const sheet = inspect.sheets.find((item) => item.sheetId === options.sheetId)
    const candidates =
      kind === 'main' ? sheet?.mainHeaderCandidates : sheet?.conversionHeaderCandidates
    form.setValue(
      kind,
      {
        ...options,
        headerRowNumber: value,
        columnMapping: candidates?.find((item) => item.rowNumber === value)?.suggestedMapping ?? [],
      },
      { shouldDirty: true }
    )
  }
  function changeColumn(kind: 'main' | 'conversions', field: string, column: string) {
    onChange()
    const options = values[kind]
    if (!options) return
    form.setValue(
      `${kind}.columnMapping`,
      [
        ...options.columnMapping.filter((item) => item.field !== field),
        ...(column === '' ? [] : [{ field, columnIndex: Number(column) }]),
      ],
      { shouldDirty: true }
    )
  }
  return (
    <form
      className="flex min-h-0 flex-col gap-4 overflow-auto"
      onSubmit={(event) => {
        event.preventDefault()
        onPreview()
      }}
    >
      <fieldset disabled={pending} className="flex flex-col gap-4">
        <legend className="mb-3 font-semibold">Ghép cột dữ liệu</legend>
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="import-main-sheet">Trang tính hàng hóa</FieldLabel>
            <NativeSelect
              id="import-main-sheet"
              aria-invalid={Boolean(form.formState.errors.main?.sheetId)}
              value={values.main.sheetId}
              onChange={(event) => changeSheet('main', event.target.value)}
            >
              <NativeSelectOption value="">Chọn trang tính</NativeSelectOption>
              {inspect.sheets.map((sheet) => (
                <NativeSelectOption key={sheet.sheetId} value={sheet.sheetId}>
                  {sheet.sheetName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {form.formState.errors.main?.sheetId ? (
              <p role="alert" className="text-destructive text-sm">
                {form.formState.errors.main.sheetId.message}
              </p>
            ) : null}
          </Field>
          <Field>
            <FieldLabel htmlFor="import-conversion-sheet">Trang tính quy đổi (tùy chọn)</FieldLabel>
            <NativeSelect
              id="import-conversion-sheet"
              value={values.conversions?.sheetId ?? ''}
              disabled={inspect.isCsv || pending}
              onChange={(event) => changeSheet('conversions', event.target.value)}
            >
              <NativeSelectOption value="">Không nhập quy đổi</NativeSelectOption>
              {inspect.sheets
                .filter((sheet) => sheet.sheetId !== values.main.sheetId)
                .map((sheet) => (
                  <NativeSelectOption key={sheet.sheetId} value={sheet.sheetId}>
                    {sheet.sheetName}
                  </NativeSelectOption>
                ))}
            </NativeSelect>
            <FieldDescription>
              Chọn rõ trang quy đổi cần nhập; những trang khác sẽ được bỏ qua có xác nhận.
            </FieldDescription>
          </Field>
        </FieldGroup>
        {(['main', 'conversions'] as const).map((kind) => {
          const options = values[kind]
          if (!options?.sheetId) return null
          return (
            <MappingSection
              key={kind}
              kind={kind}
              options={options}
              inspect={inspect}
              error={
                form.formState.errors[kind]?.columnMapping?.message ??
                form.formState.errors[kind]?.sheetId?.message ??
                form.formState.errors[kind]?.headerRowNumber?.message
              }
              onHeaderChange={(value) => changeHeader(kind, value)}
              onColumnChange={(field, column) => changeColumn(kind, field, column)}
            />
          )
        })}
        {form.formState.errors.schemaVersion ? (
          <p role="alert" className="text-destructive text-sm">
            {form.formState.errors.schemaVersion.message}
          </p>
        ) : null}
      </fieldset>
      <Button type="submit" disabled={pending || inspect.schema.version !== 1}>
        {pending ? 'Đang kiểm tra…' : 'Kiểm tra dữ liệu'}
      </Button>
    </form>
  )
}

function MappingSection({
  kind,
  options,
  inspect,
  error,
  onHeaderChange,
  onColumnChange,
}: {
  readonly kind: 'main' | 'conversions'
  readonly options: ProductImportSheetOptions
  readonly inspect: ProductImportInspect
  readonly error?: string
  readonly onHeaderChange: (row: number) => void
  readonly onColumnChange: (field: string, column: string) => void
}) {
  const sheet = inspect.sheets.find((item) => item.sheetId === options.sheetId)
  if (!sheet) return null
  const fields = kind === 'main' ? inspect.schema.mainFields : inspect.schema.conversionFields
  const candidates = kind === 'main' ? sheet.mainHeaderCandidates : sheet.conversionHeaderCandidates
  const candidate = candidates.find((item) => item.rowNumber === options.headerRowNumber)
  const columns =
    candidate?.columns ??
    [...new Set(sheet.sampleRows.flatMap((row) => Object.keys(row.values).map(Number)))]
      .sort((left, right) => left - right)
      .map((columnIndex) => ({ columnIndex, letter: String(columnIndex + 1), header: '' }))
  return (
    <section
      aria-label={kind === 'main' ? 'Cột hàng hóa' : 'Cột quy đổi'}
      className="flex flex-col gap-3 border p-3"
    >
      <Field>
        <FieldLabel htmlFor={`import-${kind}-header`}>Dòng tiêu đề — {sheet.sheetName}</FieldLabel>
        <Input
          id={`import-${kind}-header`}
          type="number"
          min={1}
          max={50}
          value={Number.isFinite(options.headerRowNumber) ? options.headerRowNumber : ''}
          aria-invalid={Boolean(error)}
          onChange={(event) => onHeaderChange(event.target.valueAsNumber)}
        />
        <FieldDescription>
          {candidates.length
            ? `Các dòng gợi ý: ${candidates.map((item) => item.rowNumber).join(', ')}. `
            : ''}
          Chọn dòng đúng trong tệp (1–50). Dữ liệu mẫu/số dòng dò ban đầu chỉ để tham khảo.
        </FieldDescription>
      </Field>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <FieldGroup className="grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <Field key={field.field}>
            <FieldLabel htmlFor={`import-${kind}-${field.field}`}>
              {field.displayName}
              {field.isRequired ? ' *' : ''}
            </FieldLabel>
            <NativeSelect
              id={`import-${kind}-${field.field}`}
              value={
                options.columnMapping.find((item) => item.field === field.field)?.columnIndex ?? ''
              }
              onChange={(event) => onColumnChange(field.field, event.target.value)}
            >
              <NativeSelectOption value="">
                {field.isRequired ? 'Chọn cột bắt buộc' : 'Không ghép'}
              </NativeSelectOption>
              {columns.map((column) => (
                <NativeSelectOption key={column.columnIndex} value={column.columnIndex}>
                  {column.letter}: {column.header || 'Không có tên'}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <FieldDescription>
              {field.description}
              {field.defaultValue ? ` Mặc định: ${field.defaultValue}.` : ''}
            </FieldDescription>
          </Field>
        ))}
      </FieldGroup>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dòng nguồn</TableHead>
            {columns.map((column) => (
              <TableHead key={column.columnIndex}>
                {column.letter}: {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sheet.sampleRows.map((row) => (
            <TableRow key={row.rowNumber}>
              <TableCell>{row.rowNumber}</TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.columnIndex}
                  className="max-w-64 break-words whitespace-normal"
                >
                  {row.values[column.columnIndex] ?? '—'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
