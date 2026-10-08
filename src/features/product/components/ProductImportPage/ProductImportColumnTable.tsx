import { SpreadsheetImportColumnTable } from '@/components/operations/SpreadsheetImportColumnTable'
import type { ComponentProps } from 'react'

export function ProductImportColumnTable(
  props: Omit<ComponentProps<typeof SpreadsheetImportColumnTable>, 'label'> & {
    readonly kind: 'main' | 'conversions'
  }
) {
  return (
    <SpreadsheetImportColumnTable
      {...props}
      label={props.kind === 'main' ? 'hàng hóa' : 'quy đổi'}
    />
  )
}
