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
  visual?: "planning" | "itinerary" | "discover" | "activity" | "budget" | "calendar";
  accent?: string;
}

export interface Step {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
  points?: string[];
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
  footnote?: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface TrustStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export interface FooterLinkGroup {
  id: string;
  title: string;
  links: NavLink[];
}

export interface FooterColumn {
  label: string;
  href?: string;
}

export interface FooterContent {
  description: string;
  columns: FooterLinkGroup[];
  madeWithTagline?: string;
}

export interface Destination {
  id: string;
  country: string;
  city: string;
  description: string;
  rating: number;
  category: string;
  image: string;
  alt: string;
}

export interface DiscoverContent {
  heading: SectionHeading;
  categories: { id: string; label: string }[];
  destinations: Destination[];
  ctaLabel: string;
}

export interface ShowcaseContent {
  badge: string;
  title: ReactNode;
  description: string;
  benefits: string[];
}

export interface TravelStory {
  id: string;
  username: string;
  handle: string;
  destination: string;
  story: string;
  image: string;
  alt: string;
  likes: string;
  comments: string;
  avatar: string;
}

export interface CommunityContent {
  heading: SectionHeading;
  stories: TravelStory[];
  ctaLabel: string;
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

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
}

export interface LandingConfig {
  appName: string;
  tagline: string;
  navLinks: NavLink[];
  hero: HeroContent;
  trustStats: TrustStat[];
  featuresHeading: SectionHeading;
  features: Feature[];
  howItWorksHeading: SectionHeading;
  steps: Step[];
  benefits: BenefitSectionContent;
  discover: DiscoverContent;
  showcase: ShowcaseContent;
  testimonials: Testimonial[];
  community: CommunityContent;
  finalCTA: FinalCTA;
  footer: FooterContent;
}