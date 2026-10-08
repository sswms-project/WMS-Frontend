import type { UseFormReturn } from 'react-hook-form'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { OperationalListPanel } from '@/components/operations/OperationalListPanel'
import { ProductImportColumnTable } from './ProductImportColumnTable'
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
      { shouldDirty: true, shouldValidate: true }
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
      { shouldDirty: true, shouldValidate: true }
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
      { shouldDirty: true, shouldValidate: true }
    )
  }
  return (
    <OperationalListPanel aria-label="Cấu hình ghép cột">
      <form
        id="product-import-mapping"
        noValidate
        data-slot="operational-list-body"
        className="flex min-h-0 flex-1 flex-col gap-4 p-3"
        onSubmit={(event) => {
          event.preventDefault()
          onPreview()
        }}
      >
        <fieldset disabled={pending} className="flex shrink-0 flex-col gap-4">
          <legend className="sr-only">Ghép cột dữ liệu</legend>
          {!inspect.isCsv ? (
            <div className="grid shrink-0 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="import-main-sheet">Trang tính hàng hóa</FieldLabel>
                <NativeSelect
                  id="import-main-sheet"
                  className="w-full"
                  aria-invalid={Boolean(form.formState.errors.main?.sheetId)}
                  aria-describedby={
                    form.formState.errors.main?.sheetId ? 'import-main-sheet-error' : undefined
                  }
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
                  <p id="import-main-sheet-error" role="alert" className="text-destructive text-sm">
                    {form.formState.errors.main.sheetId.message}
                  </p>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="import-conversion-sheet">
                  Trang tính quy đổi (tùy chọn)
                </FieldLabel>
                <NativeSelect
                  id="import-conversion-sheet"
                  className="w-full"
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
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              CSV chỉ có bảng hàng hóa, không chứa đơn vị quy đổi.
            </p>
          )}
          {!inspect.isCsv &&
          !values.conversions &&
          inspect.sheets.some(
            (sheet) =>
              sheet.sheetId !== values.main.sheetId &&
              sheet.conversionHeaderCandidates.some((candidate) => candidate.hasAllRequiredFields)
          ) ? (
            <p className="text-warning text-sm" role="status">
              Tệp có trang quy đổi nhưng chưa được chọn. Các đơn vị quy đổi trong trang đó sẽ không
              được nhập.
            </p>
          ) : null}
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
      </form>
    </OperationalListPanel>
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
  const samples = sheet.mappingRows ?? sheet.sampleRows
  const header = samples.find((row) => row.rowNumber === options.headerRowNumber)
  const columns =
    (sheet.columns?.length ? sheet.columns : candidate?.columns) ??
    [...new Set(samples.flatMap((row) => Object.keys(row.values).map(Number)))]
      .sort((left, right) => left - right)
      .map((columnIndex) => ({ columnIndex, letter: String(columnIndex + 1), header: '' }))
  const labeledColumns = columns.map((column) => ({
    ...column,
    header: header?.values[column.columnIndex] ?? column.header,
  }))
  return (
    <section
      aria-label={kind === 'main' ? 'Cột hàng hóa' : 'Cột quy đổi'}
      className="flex min-w-0 flex-col gap-3"
    >
      <h3 className="font-semibold">{kind === 'main' ? 'Hàng hóa' : 'Đơn vị quy đổi'}</h3>
      <Field>
        <FieldLabel htmlFor={`import-${kind}-header`}>Dòng tiêu đề — {sheet.sheetName}</FieldLabel>
        <Input
          id={`import-${kind}-header`}
          type="number"
          min={1}
          max={50}
          className="max-w-40"
          value={Number.isFinite(options.headerRowNumber) ? options.headerRowNumber : ''}
          aria-invalid={Boolean(error)}
          aria-describedby={`import-${kind}-header-help${error ? ` import-${kind}-error` : ''}`}
          onChange={(event) => onHeaderChange(event.target.valueAsNumber)}
        />
        <FieldDescription id={`import-${kind}-header-help`}>
          {candidates.length
            ? `Các dòng gợi ý: ${candidates.map((item) => item.rowNumber).join(', ')}. `
            : ''}
          Chọn dòng đúng trong tệp (1–50). Dữ liệu mẫu/số dòng dò ban đầu chỉ để tham khảo.
        </FieldDescription>
      </Field>
      {error ? (
        <p id={`import-${kind}-error`} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      <ProductImportColumnTable
        kind={kind}
        fields={fields}
        columns={labeledColumns}
        options={options}
        samples={samples}
        error={error}
        onColumnChange={onColumnChange}
      />
      <details>
        <summary className="text-muted-foreground cursor-pointer text-xs focus-visible:outline-2 focus-visible:outline-offset-2">
          Xem tối đa 5 dòng mẫu — {sheet.sheetName}
        </summary>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dòng nguồn</TableHead>
              {labeledColumns.map((column) => (
                <TableHead key={column.columnIndex}>
                  {column.letter}: {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {samples
              .filter((row) => row.rowNumber > options.headerRowNumber)
              .slice(0, 5)
              .map((row) => (
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
      </details>
    </section>
  )
}
