import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface BulkImportRowResultProps {
  readonly errors: readonly string[]
  readonly warnings?: readonly string[]
  readonly children?: ReactNode
}

export function BulkImportRowResult({ errors, warnings = [], children }: BulkImportRowResultProps) {
  const messages = [
    ...new Set(errors),
    ...new Set(warnings.filter((message) => !errors.includes(message))),
  ]
  return (
    <div className="flex flex-col items-start gap-1 text-xs wrap-anywhere whitespace-normal">
      <Badge variant={errors.length ? 'destructive' : 'default'}>
        {errors.length ? 'Không hợp lệ' : 'Hợp lệ'}
      </Badge>
      {children}
      {messages.length ? (
        <p className={cn(errors.length ? 'text-destructive' : 'text-muted-foreground')}>
          {messages[0]}
        </p>
      ) : null}
      {messages.length > 1 ? (
        <details className="w-full">
          <summary className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2">
            Xem chi tiết ({messages.length - 1} thông báo khác)
          </summary>
          <ul className="mt-1 flex max-h-48 flex-col gap-1 overflow-auto">
            {messages.slice(1).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}

interface BulkImportFieldCellProps {
  readonly errors?: readonly string[]
  readonly className?: string
  readonly children: ReactNode
}

export function BulkImportFieldCell({
  errors = [],
  className,
  children,
}: BulkImportFieldCellProps) {
  return (
    <TableCell
      className={cn(
        'wrap-anywhere whitespace-normal',
        className,
        errors.length > 0 && 'bg-destructive/5'
      )}
    >
      {children}
      {[...new Set(errors)].map((message) => (
        <p
          key={message}
          className="text-destructive mt-1 max-w-64 text-xs wrap-anywhere whitespace-normal"
        >
          {message}
        </p>
      ))}
    </TableCell>
  )
}
