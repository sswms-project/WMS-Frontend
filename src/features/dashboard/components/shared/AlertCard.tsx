'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react'

interface AlertCardProps {
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
  actionLabel: string
  onAction?: () => void
  disabled?: boolean
  disabledReason?: string
}

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-muted border-border',
    iconColor: 'text-destructive',
  },
  info: {
    icon: Zap,
    bg: 'bg-muted border-border',
    iconColor: 'text-tertiary',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-muted border-border',
    iconColor: 'text-primary',
  },
}

export function AlertCard({
  type,
  title,
  description,
  actionLabel,
  onAction,
  disabled = false,
  disabledReason,
}: AlertCardProps) {
  const config = alertConfig[type]
  const Icon = config.icon

  return (
    <Card className={`${config.bg} border-2 p-5`}>
      <div className="flex items-start gap-4">
        <Icon className={`${config.iconColor} mt-0.5 size-5 flex-shrink-0`} />

        <div className="flex-grow">
          <h4 className="text-foreground text-sm font-semibold tracking-wide uppercase">{title}</h4>
          <p className="text-foreground/80 mt-2 text-sm leading-relaxed">{description}</p>

          {actionLabel && (
            <AlertCardAction
              actionLabel={actionLabel}
              disabled={disabled}
              disabledReason={disabledReason}
              onAction={onAction}
            />
          )}
        </div>
      </div>
    </Card>
  )
}

interface AlertCardActionProps {
  readonly actionLabel: string
  readonly disabled: boolean
  readonly disabledReason?: string
  readonly onAction?: () => void
}

function AlertCardAction({
  actionLabel,
  disabled,
  disabledReason,
  onAction,
}: AlertCardActionProps) {
  const actionButton = (
    <Button size="sm" variant="default" className="mt-4" disabled={disabled} onClick={onAction}>
      {actionLabel}
    </Button>
  )

  if (!disabled || !disabledReason) return actionButton

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{actionButton}</span>
      </TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  )
}
