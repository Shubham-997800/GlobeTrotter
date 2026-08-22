import { landingConfig } from "@/config/landing.config";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export function LandingPage() {
  const { appName, navLinks, hero, featuresHeading, features } = landingConfig;
  const { howItWorksHeading, steps, benefits, finalCTA, footer } =
    landingConfig;

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar appName={appName} navLinks={navLinks} />
      <main className="flex-1">
        <HeroSection hero={hero} />
        <FeaturesSection heading={featuresHeading} features={features} />
        <HowItWorksSection heading={howItWorksHeading} steps={steps} />
        <BenefitsSection benefits={benefits} />
        <CTASection cta={finalCTA} />
      </main>
      <LandingFooter
        appName={appName}
        tagline={landingConfig.tagline}
        footer={footer}
      />
    </div>
  );
}