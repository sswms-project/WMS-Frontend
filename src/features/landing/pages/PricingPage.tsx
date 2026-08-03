import { HomeFooter, HomeHeader, PricingSection } from '../components/HomePage'

export function PricingPage() {
  return (
    <div className="theme-home bg-background text-foreground flex min-h-dvh flex-col">
      <HomeHeader />
      <main className="flex-1">
        <PricingSection />
      </main>
      <HomeFooter />
    </div>
  )
}
