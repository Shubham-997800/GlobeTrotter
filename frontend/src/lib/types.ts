import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface CTA {
  label: string;
  href: string;
}

export interface HeroContent {
  badge: string;
  title: ReactNode;
  description: string;
  primaryCTA: CTA;
  secondaryCTA: CTA;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Step {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
}

export interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface FinalCTA {
  badge: string;
  title: string;
  description: string;
  primaryCTA: CTA;
  secondaryCTA?: CTA;
}

export interface Stat {
  value: string;
  label: string;
}

export interface FooterContent {
  description: string;
  quickLinks: NavLink[];
  socials: {
    name: string;
    href: string;
    icon: LucideIcon;
  }[];
}

export interface BenefitSectionContent {
  badge: string;
  title: ReactNode;
  description: string;
  items: Benefit[];
  stats: Stat[];
}

export interface SectionHeading {
  badge: string;
  title: ReactNode;
  description?: string;
}

export interface LandingConfig {
  appName: string;
  tagline: string;
  navLinks: NavLink[];
  hero: HeroContent;
  featuresHeading: SectionHeading;
  features: Feature[];
  howItWorksHeading: SectionHeading;
  steps: Step[];
  benefits: BenefitSectionContent;
  finalCTA: FinalCTA;
  footer: FooterContent;
}