import type { Route } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { AiCard } from '../../types/ai-assistant.types'
import { AI_NAVIGATION_ICONS, DefaultAiNavigationIcon } from '../../utils/ai-assistant-icons'
import { isAiAppPath } from '../../utils/ai-assistant-links'

interface AiNavigationCardProps {
  readonly card: AiCard
  readonly onNavigate: () => void
}

export function AiNavigationCard({ card, onNavigate }: AiNavigationCardProps) {
  if (!isAiAppPath(card.actionUrl)) return null

  const Icon = AI_NAVIGATION_ICONS[card.icon ?? ''] ?? DefaultAiNavigationIcon

  return (
    <Link
      // The path comes from WMS-Model's static route map and is re-validated by the BE and isAiAppPath.
      href={card.actionUrl as Route}
      onNavigate={onNavigate}
      className="group bg-card hover:bg-muted focus-visible:ring-ring flex min-w-0 items-center gap-3 rounded-md border p-3 transition-colors outline-none focus-visible:ring-2"
    >
      <span className="bg-tertiary/10 text-tertiary flex size-9 shrink-0 items-center justify-center rounded-md">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{card.title}</span>
        {card.description ? (
          <span className="text-muted-foreground block truncate text-xs">{card.description}</span>
        ) : null}
      </span>
      <ArrowRight
        className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </Link>
  )
}
