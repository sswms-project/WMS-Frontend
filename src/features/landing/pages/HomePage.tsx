import {
  DataInsightsSection,
  FeatureHighlightsSection,
  HeroSection,
  HomeFooter,
  HomeHeader,
  PricingSection,
  TrustBadgesSection,
} from '../components/HomePage'

export function HomePage() {
  return (
    <div className="theme-home bg-background text-foreground flex min-h-dvh flex-col">
      <HomeHeader />
      <main className="flex-1">
        <HeroSection />
        <TrustBadgesSection />
        <FeatureHighlightsSection />
        <DataInsightsSection />
        <PricingSection />
      </main>
      <HomeFooter />
    </div>
  )
}
