import {
  Map,
  Compass,
  CalendarDays,
  Wallet,
  Route,
  Users,
  Sparkles,
  MapPin,
  Luggage,
  Plane,
} from "lucide-react";

import type { LandingConfig } from "@/lib/types";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1400`;

const avatar = (name: string, bg: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=${bg}&color=fff&size=160&bold=true`;

/**
 * Central, single source of truth for the landing page.
 *
 * Adapt text + icons here instead of redesigning components.
 */
export const landingConfig: LandingConfig = {
  appName: "GlobeTrotter",
  tagline: "Personalized travel planning",

  navLinks: [
    { id: "home", label: "Home", href: "#home" },
    { id: "features", label: "Features", href: "#features" },
    { id: "how-it-works", label: "How It Works", href: "#how-it-works" },
    { id: "explore", label: "Explore", href: "#explore" },
    { id: "community", label: "Community", href: "#community" },
  ],

  hero: {
    badge: "Plan Smarter. Travel Better.",
    title: (
      <>
        Plan Every Journey.
        <br />
        Experience Every Moment.
        <span className="text-primary"> Your Way.</span>
      </>
    ),
    description:
      "GlobeTrotter turns complex multi-city planning into a single, calm place — build day-wise itineraries, discover activities, and keep your budget on track while you focus on the experience.",
    primaryCTA: { label: "Start Planning", href: "/get-started" },
    secondaryCTA: { label: "Explore Destinations", href: "#explore" },
  },

  trustStats: [
    { icon: Users, value: "10K+", label: "Travelers" },
    { icon: Luggage, value: "2.5K+", label: "Trips Planned" },
    { icon: MapPin, value: "120+", label: "Destinations" },
  ],

  featuresHeading: {
    badge: "Everything You Need",
    title: "Everything for a Perfect Journey",
    description:
      "GlobeTrotter brings planning, discovery, itinerary management and budgeting together into one beautifully simple travel workspace.",
  },

  features: [
    {
      icon: Map,
      visual: "planning",
      accent: "city",
      title: "Smart Trip Planning",
      description:
        "Start with a destination, pick your dates and set a budget — GlobeTrotter scaffolds your whole trip instantly.",
    },
    {
      icon: Route,
      visual: "itinerary",
      accent: "primary",
      title: "Itinerary Builder",
      description:
        "Add cities, stays and activities, then organize them into clean, day-wise plans that flow naturally.",
    },
    {
      icon: Compass,
      visual: "discover",
      accent: "city",
      title: "Discover Destinations",
      description:
        "Explore curated cities, landmarks and hidden gems with ratings and routes that match your travel style.",
    },
    {
      icon: Sparkles,
      visual: "activity",
      accent: "activity",
      title: "Activity Explorer",
      description:
        "Browse experiences, tours and dining near every stop, and drop the ones you love into your itinerary.",
    },
    {
      icon: Wallet,
      visual: "budget",
      accent: "budget",
      title: "Budget Management",
      description:
        "Estimate total costs, track every expense and see at a glance how your spend lines up with your plan.",
    },
    {
      icon: CalendarDays,
      visual: "calendar",
      accent: "city",
      title: "Travel Calendar",
      description:
        "Visualize your whole journey as a timeline and calendar, so nothing is ever double-booked or forgotten.",
    },
  ],

  howItWorksHeading: {
    badge: "How It Works",
    title: "From idea to itinerary in 3 steps",
    description:
      "A calm, guided flow that turns a spark of wanderlust into a fully organized trip.",
  },

  steps: [
    {
      icon: MapPin,
      number: "01",
      title: "Create Your Trip",
      description:
        "Pick a destination, choose your dates and set a budget — your trip workspace is ready in seconds.",
      points: ["Select Destination", "Choose Dates", "Set Budget"],
    },
    {
      icon: Route,
      number: "02",
      title: "Build Your Itinerary",
      description:
        "Add cities, assign activities and organize every day with a clear timeline you can drag and reorder.",
      points: ["Add Cities", "Add Activities", "Organize Days"],
    },
    {
      icon: Plane,
      number: "03",
      title: "Explore & Enjoy",
      description:
        "Track your journey, manage your budget live and share the plan with your group as you travel.",
      points: ["Track Your Journey", "Manage Your Budget"],
    },
  ],
  discover: {
    heading: {
      badge: "Explore Destinations",
      title: "Find the journey that fits you",
      description:
        "From buzzing cities to serene coastlines, discover places that feel made for how you want to travel.",
    },
    categories: [
      { id: "all", label: "Popular" },
      { id: "beaches", label: "Beaches" },
      { id: "mountains", label: "Mountains" },
      { id: "cities", label: "Cities" },
      { id: "adventure", label: "Adventure" },
    ],
    destinations: [
      {
        id: "kyoto",
        country: "Japan",
        city: "Kyoto",
        description: "Temples, gardens and lantern-lit streets in perfect harmony.",
        rating: 4.9,
        category: "cities",
        image: img("photo-1493976040374-85c8e12f0c0e"),
        alt: "Kyoto street with traditional wooden houses at dusk",
      },
      {
        id: "bali",
        country: "Indonesia",
        city: "Bali",
        description: "Terraced rice fields, warm beaches and soulful sunsets.",
        rating: 4.8,
        category: "beaches",
        image: img("photo-1537996194471-e657df975ab4"),
        alt: "Palm-fringed beach in Bali with clear water",
      },
      {
        id: "paris",
        country: "France",
        city: "Paris",
        description: "Iconic boulevards, art and cafés that never lose their magic.",
        rating: 4.9,
        category: "cities",
        image: img("photo-1502602898657-3e91760cbb34"),
        alt: "The Eiffel Tower seen across the rooftops of Paris",
      },
      {
        id: "swiss-alps",
        country: "Switzerland",
        city: "Swiss Alps",
        description: "Snow-tipped peaks and lake trails made for adventurers.",
        rating: 4.9,
        category: "mountains",
        image: img("photo-1527668752968-14dc70a27c95"),
        alt: "Snow-covered Alpine peaks under a clear blue sky",
      },
      {
        id: "dubai",
        country: "UAE",
        city: "Dubai",
        description: "Dazzling skylines, desert thrills and futuristic nightscapes.",
        rating: 4.7,
        category: "adventure",
        image: img("photo-1512453979798-5ea266f8880c"),
        alt: "The Dubai skyline and its illuminated towers at night",
      },
      {
        id: "new-york",
        country: "USA",
        city: "New York",
        description: "Neon energy, iconic neighborhoods and endless discovery.",
        rating: 4.8,
        category: "cities",
        image: img("photo-1496442226666-8d4d0e62e6e9"),
        alt: "Manhattan skyline rising in the golden light",
      },
    ],
    ctaLabel: "Explore More",
  },

  showcase: {
    badge: "The Product",
    title: (
      <>
        Your whole trip,
        <br />
        <span className="text-primary">on one canvas.</span>
      </>
    ),
    description:
      "This is what planning actually feels like in GlobeTrotter — a calm, organized home for every itinerary, activity and rupee, ready when you are.",
    benefits: [
      "Organize Multiple Trips",
      "Build Day-wise Plans",
      "Track Activities",
      "Manage Expenses",
    ],
  },

  testimonials: [
    {
      name: "Priya Sharma",
      role: "Solo Traveler · 12 trips planned",
      quote:
        "GlobeTrotter turned my Japan trip from a 3-week spreadsheet nightmare into a 20-minute planning session. The budget tracker alone saved me ₹15,000.",
      avatar: avatar("Priya Sharma", "e74c3c"),
      rating: 5,
    },
    {
      name: "Rohan & Ananya",
      role: "Couple · Bali & Thailand trips",
      quote:
        "We used to fight over which restaurant to book. Now we just share the itinerary and both know exactly what's happening. Total game-changer for couples.",
      avatar: avatar("Rohan Ananya", "3498db"),
      rating: 5,
    },
    {
      name: "Vikram Patel",
      role: "Group Organizer · Europe 2025",
      quote:
        "Coordinating 8 people across 4 countries? I'd have lost my mind without GlobeTrotter. The shared calendar kept everyone on the same page.",
      avatar: avatar("Vikram Patel", "2ecc71"),
      rating: 5,
    },
  ],

  community: {
    heading: {
      badge: "Community",
      title: "Trips shared by travelers like you",
      description:
        "GlobeTrotter is more than a planner — it's a place to discover, share and get inspired by real journeys.",
    },
    stories: [
      {
        id: "maya",
        username: "Maya Chen",
        handle: "@mayatravels",
        destination: "Bali, Indonesia",
        story:
          "Planned a 10-day island hop entirely in GlobeTrotter — the day-wise plans kept our whole group in sync.",
        image: img("photo-1507525428034-b723cf961d3e"),
        alt: "A tropical beach with soft waves at sunset",
        likes: "1.2K",
        comments: "84",
        avatar: avatar("Maya Chen", "0284c7"),
      },
      {
        id: "arjun",
        username: "Arjun Mehta",
        handle: "@arjunexplores",
        destination: "Swiss Alps, Switzerland",
        story:
          "The calendar view made a 4-country rail trip feel effortless. Every train and hike right where I needed it.",
        image: img("photo-1502920917128-1aa500764cbd"),
        alt: "Hiker capturing mountain valleys with a camera",
        likes: "980",
        comments: "51",
        avatar: avatar("Arjun Mehta", "059669"),
      },
      {
        id: "sofia",
        username: "Sofia Reyes",
        handle: "@sofiawanders",
        destination: "Paris, France",
        story:
          "I shared the live itinerary with friends and everyone stopped asking the same questions. Genuine game-changer.",
        image: img("photo-1469854523086-cc02fe5d8800"),
        alt: "A camper van on a scenic open road",
        likes: "1.6K",
        comments: "120",
        avatar: avatar("Sofia Reyes", "7c3aed"),
      },
    ],
    ctaLabel: "Explore Community",
  },

  finalCTA: {
    badge: "Ready when you are",
    title: "Your Next Adventure Starts Here.",
    description:
      "Stop planning across scattered tabs and spreadsheets — organize your entire journey in GlobeTrotter and get back to the part you love: traveling.",
    primaryCTA: { label: "Start Planning Your Trip", href: "/get-started" },
    secondaryCTA: { label: "Explore Destinations", href: "/explore" },
    footnote: "Free to get started · No credit card required",
  },

  footer: {
    description:
      "The personalized travel-planning platform that helps you build, budget, visualize and share unforgettable journeys.",
    columns: [
      {
        id: "product",
        title: "Product",
        links: [
          { id: "explore", label: "Explore", href: "/explore" },
          { id: "trips", label: "Trips", href: "/trips" },
          { id: "calendar", label: "Calendar", href: "/calendar" },
          { id: "community", label: "Community", href: "/community" },
        ],
      },
      {
        id: "company",
        title: "Company",
        links: [
          { id: "about", label: "About Us", href: "/help" },
          { id: "help", label: "Help Center", href: "/help" },
          { id: "blog", label: "Blog", href: "/help" },
          { id: "careers", label: "Careers", href: "/help" },
        ],
      },
      {
        id: "support",
        title: "Support",
        links: [
          { id: "privacy", label: "Privacy Policy", href: "__privacy__" },
          { id: "terms", label: "Terms & Conditions", href: "__terms__" },
          { id: "contact", label: "Contact Us", href: "/help" },
          { id: "status", label: "System Status", href: "/help" },
        ],
      },
    ],
    madeWithTagline: "Made for Travelers 🌍",
  },
};