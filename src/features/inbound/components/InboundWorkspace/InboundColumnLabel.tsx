'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface InboundColumnLabelProps {
  readonly label: string
  readonly description: string
}

export function InboundColumnLabel({ label, description }: InboundColumnLabelProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            aria-label={label}
            className="focus-visible:outline-ring cursor-help focus-visible:outline-1"
          >
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent>{description}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
