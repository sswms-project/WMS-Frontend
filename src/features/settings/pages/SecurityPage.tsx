import { ChangePasswordCard, SecurityOverviewCard, TwoFactorCard } from '../components/SecurityPage'

export function SecurityPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr]">
      <SecurityOverviewCard />
      <div className="flex min-w-0 flex-col gap-6">
        <ChangePasswordCard />
        <TwoFactorCard />
      </div>
    </div>
  )
}
