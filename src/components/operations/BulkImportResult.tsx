'use client'

import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { bulkImportResultsCsv, type BulkImportResultRow } from './bulk-import'

export interface BulkImportResultItem extends BulkImportResultRow {
  readonly isImported: boolean
}

interface BulkImportResultProps {
  readonly entityLabel: string
  readonly listHref: Route
  readonly listLabel: string
  readonly resultFileName: string
  readonly items: readonly BulkImportResultItem[]
  readonly onRestart: () => void
}

export function BulkImportResult({
  entityLabel,
  listHref,
  listLabel,
  resultFileName,
  items,
  onRestart,
}: BulkImportResultProps) {
  const importedCount = items.filter((item) => item.isImported).length
  const skippedCount = items.length - importedCount

  function exportResults() {
    const csv = bulkImportResultsCsv(items)
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = resultFileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="text-primary" aria-hidden="true" />
          Đã hoàn tất nhập {entityLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm" role="status">
          Đã nhập <strong>{importedCount}</strong> {entityLabel}; bỏ qua {skippedCount} dòng.
        </p>
        <div className="max-h-96 overflow-auto border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Dòng</TableHead>
                <TableHead>{entityLabel}</TableHead>
                <TableHead>Kết quả</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.rowNumber}>
                  <TableCell className="tabular-nums">{item.rowNumber}</TableCell>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>
                    <Badge variant={item.isImported ? 'default' : 'outline'}>{item.result}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={listHref}>{listLabel}</Link>
          </Button>
          <Button variant="outline" onClick={exportResults}>
            <Download aria-hidden="true" />
            Xuất kết quả CSV
          </Button>
          <Button variant="outline" onClick={onRestart}>
            <RefreshCw aria-hidden="true" />
            Nhập thêm tệp
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
