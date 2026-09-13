import { FileSearch, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

interface UploadStepProps {
  readonly file: File | null
  readonly fileError: string | null
  readonly isStarting: boolean
  readonly onFileChange: (file: File | null) => void
  readonly onAnalyze: () => void
}

export function UploadStep({
  file,
  fileError,
  isStarting,
  onFileChange,
  onAnalyze,
}: UploadStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-tertiary-container/20 flex items-start gap-3 border p-3">
        <Sparkles className="text-tertiary mt-0.5" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">AI chỉ hỗ trợ nhập liệu</p>
          <p className="text-muted-foreground text-xs">
            Hệ thống trích xuất dữ liệu để bạn kiểm tra. Không tồn kho nào thay đổi ở bước này.
          </p>
        </div>
      </div>
      <Field data-invalid={Boolean(fileError)}>
        <FieldLabel htmlFor="inbound-document">Chứng từ nhà cung cấp</FieldLabel>
        <Input
          id="inbound-document"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.csv"
          disabled={isStarting}
          aria-invalid={Boolean(fileError)}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <FieldDescription>PDF, JPG, PNG, DOCX, XLSX hoặc CSV · tối đa 10 MB</FieldDescription>
        <FieldError>{fileError}</FieldError>
      </Field>
      {file ? (
        <div className="bg-muted flex items-center justify-between gap-3 border p-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileSearch aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {(file.size / 1024).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} KB
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Bỏ tệp đã chọn"
            disabled={isStarting}
            onClick={() => onFileChange(null)}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      ) : null}
      <div className="flex justify-end">
        <Button type="button" disabled={!file || isStarting} onClick={onAnalyze}>
          {isStarting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Sparkles data-icon="inline-start" />
          )}
          {isStarting ? 'Đang phân tích…' : 'Phân tích chứng từ'}
        </Button>
      </div>
    </div>
  )
}
