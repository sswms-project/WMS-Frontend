import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/lib/utils'

interface SectionIconBadgeProps {
  readonly icon: ComponentType<SVGProps<SVGSVGElement>>
  readonly tone?: 'neutral' | 'primary'
  readonly size?: 'sm' | 'lg'
  readonly className?: string
}

export function SectionIconBadge({
  icon: Icon,
  tone = 'neutral',
  size = 'sm',
  className,
}: SectionIconBadgeProps) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg',
        size === 'lg' ? 'size-11' : 'size-[30px]',
        tone === 'primary' ? 'bg-primary/10' : 'bg-muted',
        className
      )}
    >
      <Icon
        className={cn(
          size === 'lg' ? 'size-[22px]' : 'size-[15px]',
          tone === 'primary' ? 'text-primary' : 'text-secondary'
        )}
        aria-hidden="true"
      />
    </span>
  )
}
