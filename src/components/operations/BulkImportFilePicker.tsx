'use client'

import { FileSpreadsheet, LoaderCircle, Upload } from 'lucide-react'
import { useId, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BULK_IMPORT_FILE_EXTENSIONS, BULK_IMPORT_MAX_FILE_MB } from './bulk-import'

interface BulkImportFilePickerProps {
  readonly entityLabel: string
  readonly maxRows: number
  readonly pending: boolean
  readonly error: string | null
  readonly onFileChange: (file: File) => void
}

export function BulkImportFilePicker({
  entityLabel,
  maxRows,
  pending,
  error,
  onFileChange,
}: BulkImportFilePickerProps) {
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  return (
    <Card>
      <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 p-6 text-center">
        <FileSpreadsheet className="text-primary size-10" aria-hidden="true" />
        <h2 className="font-semibold">Chọn tệp {entityLabel}</h2>
        <p className="text-muted-foreground text-sm">
          XLSX hoặc CSV, tối đa {maxRows} dòng và {BULK_IMPORT_MAX_FILE_MB} MB.
        </p>
        <Button
          type="button"
          disabled={pending}
          aria-controls={inputId}
          onClick={() => input.current?.click()}
        >
          {pending ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Upload aria-hidden="true" />
          )}
          {pending ? 'Đang kiểm tra tệp…' : 'Tải tệp lên'}
        </Button>
        <Input
          id={inputId}
          ref={input}
          tabIndex={-1}
          type="file"
          className="sr-only"
          aria-label={`Tệp ${entityLabel}`}
          accept={BULK_IMPORT_FILE_EXTENSIONS.join(',')}
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) onFileChange(file)
          }}
        />
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
