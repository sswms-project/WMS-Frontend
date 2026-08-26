'use client'

import { useRef, useState } from 'react'
import { CloudUpload, LoaderCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProductImportDialogProps {
  readonly open: boolean
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onImport: (file: File) => void
}

export function ProductImportDialog({
  open,
  isPending,
  onOpenChange,
  onImport,
}: ProductImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
      setFile(f)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  function handleClose() {
    if (isPending) return
    setFile(null)
    onOpenChange(false)
  }

  function handleSubmit() {
    if (file) onImport(file)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nhập dữ liệu từ Excel</DialogTitle>
        </DialogHeader>

        <div
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/30 hover:border-primary/50'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
          <CloudUpload className="text-muted-foreground size-10" aria-hidden="true" />
          {file ? (
            <div className="text-center">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm">
                Kéo thả file vào đây hoặc{' '}
                <span className="text-primary font-medium underline underline-offset-2">
                  Chọn file (.xlsx)
                </span>
              </p>
              <p className="text-muted-foreground mt-1 text-xs">Hỗ trợ định dạng .xlsx và .xls</p>
            </div>
          )}
        </div>

        {file && (
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setFile(null)}
              disabled={isPending}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" disabled={isPending} onClick={handleClose}>
            Đóng
          </Button>
          <Button type="button" disabled={!file || isPending} onClick={handleSubmit}>
            {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            Nhập dữ liệu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
