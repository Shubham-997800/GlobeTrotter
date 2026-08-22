import {
  Map,
  Compass,
  CalendarDays,
  Wallet,
  Bell,
  Globe,
  Plane,
  Route,
  Camera,
  ShieldCheck,
  Users,
  Zap,
  TrendingUp,
  Sparkles,
  Clock,
  LineChart,
} from "lucide-react";

import type { LandingConfig } from "@/lib/types";

/**
 * Central, single source of truth for the landing page.
 *
 * After the hackathon problem statement is revealed, adapt this file
 * (mostly text + icons) instead of redesigning component structure.
 */
export const landingConfig: LandingConfig = {
  appName: "GlobeTrotter",
  tagline: "The calm way to plan your travels",

  navLinks: [
    { id: "features", label: "Features", href: "#features" },
    { id: "how-it-works", label: "How It Works", href: "#how-it-works" },
    { id: "benefits", label: "Benefits", href: "#benefits" },
  ],

  hero: {
    badge: "Now in public beta",
    title: (
      <>
        Every journey planned to perfection,
        <span className="text-primary"> without the chaos</span>.
      </>
    ),
    description:
      "GlobeTrotter brings your itineraries, bookings, and budgets into one calm place. Plan the trip, see everything clearly, and travel — worry-free.",
    primaryCTA: { label: "Get Started", href: "/get-started" },
    secondaryCTA: { label: "Learn More", href: "#how-it-works" },
  },

  featuresHeading: {
    badge: "Why GlobeTrotter",
    title: "Everything your trip needs. Nothing it doesn't.",
    description:
      "Powerful planning tools that adapt to the way you travel — no wasted setup, no endless configuration.",
  },

  features: [
    {
      icon: Map,
      title: "One Connected Itinerary",
      description:
        "Flights, stays, and activities live on a single timeline so nothing important slips through the cracks.",
    },
    {
      icon: Compass,
      title: "Smart Day Plans",
      description:
        "Build day-by-day plans in minutes with routes, timings, and travel time handled for you.",
    },
    {
      icon: CalendarDays,
      title: "Day, Map & List Views",
      description:
        "See your trip the way you'll live it — switch between days, maps, and lists instantly.",
    },
    {
      icon: Wallet,
      title: "Real-time Budget Tracking",
      description:
        "Every expense lands in one dashboard so you always know exactly what's left to spend.",
    },
    {
      icon: Bell,
      title: "Smart Travel Alerts",
      description:
        "Get notified only when it matters — check-ins, weather shifts, and booking changes.",
    },
    {
      icon: ShieldCheck,
      title: "Documents, Secured",
      description:
        "Passports, visas, and confirmations stored safely by default and ready when you need them.",
    },
  ],

  howItWorksHeading: {
    badge: "How It Works",
    title: "Trip-ready in three steps",
    description:
      "From a blank map to a full itinerary in minutes — no spreadsheets required.",
  },

  steps: [
    {
      icon: Plane,
      number: "01",
      title: "Create your trip",
      description:
        "Pick a destination, set your dates, and your trip workspace is ready in one click.",
    },
    {
      icon: Route,
      number: "02",
      title: "Build your itinerary",
      description:
        "Add stays, activities, and transport — GlobeTrotter maps everything into a clear daily flow.",
    },
    {
      icon: Camera,
      number: "03",
      title: "Travel worry-free",
      description:
        "Schedules, bookings, and budgets stay in your pocket — so you can simply enjoy the journey.",
    },
  ],

  benefits: {
    badge: "Why choose GlobeTrotter",
    title: "A calmer way to plan your travels",
    description:
      "Designed to reduce planning stress, not add it. Travelers choose GlobeTrotter because it makes trips feel lighter and the journey easier to enjoy.",
    items: [
      {
        icon: Zap,
        title: "Plan trips 2x faster",
        description:
          "Ready-made templates and smart suggestions turn hours of research into minutes.",
      },
      {
        icon: Users,
        title: "Built for group trips",
        description:
          "Shared itineraries and split budgets keep everyone moving in the same direction.",
      },
      {
        icon: LineChart,
        title: "Clarity on every budget",
        description:
          "Live spend tracking shows exactly where the money goes — before it's gone.",
      },
      {
        icon: Sparkles,
        title: "Adopted in minutes, not weeks",
        description:
          "Intuitive by design — if you can book a flight, you can plan a trip here.",
      },
    ],
    stats: [
      { value: "2x", label: "Faster trip planning" },
      { value: "40%", label: "Less planning stress" },
      { value: "98%", label: "Traveler satisfaction" },
      { value: "24/7", label: "Trip assistance" },
    ],
  },

  finalCTA: {
    badge: "Get started",
    title: "Ready to plan a calmer, smoother trip?",
    description:
      "Join thousands of travelers who plan their journeys on GlobeTrotter. Free to start, no credit card required.",
    primaryCTA: { label: "Get Started Free", href: "/get-started" },
    secondaryCTA: { label: "Talk to us", href: "/get-started" },
  },

  footer: {
    description:
      "The travel companion that helps modern explorers plan, organize, and live their best journeys — all in one calm place.",
    quickLinks: [
      { id: "features", label: "Features", href: "#features" },
      { id: "how-it-works", label: "How It Works", href: "#how-it-works" },
      { id: "benefits", label: "Benefits", href: "#benefits" },
    ],
    socials: [
      { name: "X (Twitter)", href: "#", icon: Globe },
      { name: "Instagram", href: "#", icon: Camera },
      { name: "YouTube", href: "#", icon: TrendingUp },
      { name: "Blog", href: "#", icon: Clock },
    ],
  },
};
