interface DashboardHeaderProps {
  title: string
  description: string
  actions?: React.ReactNode
}

export function DashboardHeader({ title, description, actions }: DashboardHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-foreground text-2xl leading-tight font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {actions && <div className="min-w-0 sm:shrink-0">{actions}</div>}
    </div>
  )
}
