import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type OperationalListPanelProps = ComponentProps<'section'>

export function OperationalListPanel({ className, ...props }: OperationalListPanelProps) {
  return (
    <section
      className={cn(
        'bg-card flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border',
        '[&>[data-slot=table-container]]:min-h-0 [&>[data-slot=table-container]]:flex-1 [&>[data-slot=table-container]]:overflow-auto',
        '[&>[data-slot=operational-list-body]]:min-h-0 [&>[data-slot=operational-list-body]]:flex-1 [&>[data-slot=operational-list-body]]:overflow-auto',
        className
      )}
      {...props}
    />
  )
}
