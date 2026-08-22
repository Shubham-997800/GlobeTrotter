import { landingConfig } from "@/config/landing.config";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsBar } from "@/components/landing/StatsBar";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ExploreDestinations } from "@/components/landing/ExploreDestinations";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { CommunityPreview } from "@/components/landing/CommunityPreview";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function LandingPage() {
  const {
    appName,
    tagline,
    navLinks,
    hero,
    trustStats,
    featuresHeading,
    features,
    howItWorksHeading,
    steps,
    discover,
    showcase,
    community,
    finalCTA,
    footer,
  } = landingConfig;

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar appName={appName} navLinks={navLinks} />
      <main className="flex-1">
        <HeroSection hero={hero} trustStats={trustStats} />
        <StatsBar />
        <FeaturesSection heading={featuresHeading} features={features} />
        <HowItWorksSection heading={howItWorksHeading} steps={steps} />
        <ExploreDestinations discover={discover} />
        <ProductShowcase showcase={showcase} />
        <CommunityPreview community={community} />
        <CTASection cta={finalCTA} />
      </main>
      <LandingFooter appName={appName} tagline={tagline} footer={footer} />
    </div>
  );
}