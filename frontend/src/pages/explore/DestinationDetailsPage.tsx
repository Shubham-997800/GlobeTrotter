import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Plus,
  Star,
  Users,
  Bookmark,
  Share2,
  Clock,
  Zap,
  Sun,
  Snowflake,
  Waves,
  Mountain,
  Utensils,
  Landmark,
  Music,
  Coffee,
  Loader,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AddToTripDialog } from "@/features/explore/components/AddToTripDialog";
import { DestinationDetailSkeleton } from "@/features/explore/components/ExploreSkeletons";
import { useDestinationDetail, useToggleSavedDestination } from "@/features/explore/useExplore";
import type { PlaceCard, ExploreActivity, ExploreDestination } from "@/features/explore/explore.types";
import { formatMoneyRaw } from "@/features/trips/trips.utils";

interface LocalBudgetTier {
  id: string;
  label: string;
  description: string;
  costMultiplier: number;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  adventure: Zap,
  nature: Mountain,
  beaches: Waves,
  mountains: Mountain,
  culture: Landmark,
  food: Utensils,
  history: Landmark,
  "city-life": Users,
  nightlife: Music,
  relaxation: Coffee,
};

const MONTH_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  spring: Sun,
  summer: Sun,
  autumn: Loader,
  winter: Snowflake,
};

interface BestTimeData {
  season: string;
  months: string;
  description: string;
}

export function DestinationDetailsPage() {
  const { destinationId } = useParams<{ destinationId: string }>();

  const { data: detail, isLoading, isError } = useDestinationDetail(destinationId ?? "");

  const [activeTab, setActiveTab] = useState("overview");
  const [addToTripOpen, setAddToTripOpen] = useState(false);

  const toggleSaved = useToggleSavedDestination();
  const saved = detail?.saved ?? false;

  const handleSaveToggle = useCallback(() => {
    if (!detail) return;
    toggleSaved.mutate(detail.destination.id);
  }, [detail, toggleSaved]);

  const handleAddToTrip = useCallback(() => {
    if (detail) setAddToTripOpen(true);
  }, [detail]);

  const handleShare = useCallback(async () => {
    if (!detail) return;
    const url = `${window.location.origin}/explore/destinations/${detail.destination.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${detail.destination.city} · GlobeTrotter`,
          text: `Check out ${detail.destination.city}, ${detail.destination.country} on GlobeTrotter!`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch {
      // User cancelled or error
    }
  }, [detail]);

  if (isLoading) {
    return <DestinationDetailSkeleton />;
  }

  if (isError || !detail) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10">
            <MapPin className="size-10 text-destructive" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Destination not found</h2>
          <p className="text-sm text-muted-foreground">
            This destination may have been removed or the link is invalid.
          </p>
          <Button asChild variant="secondary">
            <Link to="/explore">Back to Explore</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { destination, topPlaces, popularActivities } = detail;
  const estimatedBudget = formatMoneyRaw(
    destination.estimatedDailyCostInr *
      (destination.recommendedDuration.includes("–")
        ? parseInt(destination.recommendedDuration.split("–")[1])
        : parseInt(destination.recommendedDuration)),
    "INR"
  );

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto space-y-8 px-4 py-6">
        {/* Hero */}
        <section aria-labelledby="destination-title" className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={destination.image}
              alt={destination.imageAlt}
              className="h-[500px] w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>

          <div className="relative z-10 p-6 md:p-10 lg:p-14">
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {destination.country}
                </span>
                {destination.tags.slice(0, 3).map((tag) => {
                  const Icon = CATEGORY_ICONS[tag] || Loader;
                  return (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <Icon className="size-3" aria-hidden="true" />
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </span>
                  );
                })}
              </div>

              <h1 id="destination-title" className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
                {destination.city}
              </h1>

              <div className="mt-3 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-white backdrop-blur-sm">
                  <Star className="size-5 fill-warning text-warning" aria-hidden="true" />
                  <span className="font-semibold">{destination.rating.toFixed(1)}</span>
                  <span className="text-sm text-white/70">({destination.reviews.toLocaleString()} reviews)</span>
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Best Time</p>
                    <p className="text-sm">{destination.bestTimeToVisit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm">{destination.recommendedDuration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-sm">from {estimatedBudget}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to={`/trips/create?destination=${destination.id}`}>
                    <Plus className="size-4 mr-2" aria-hidden="true" />
                    Plan a Trip Here
                  </Link>
                </Button>
                <Button variant="outline" size="lg" onClick={handleAddToTrip} className="w-full sm:w-auto">
                  <Plus className="size-4 mr-2" aria-hidden="true" />
                  Add to Existing Trip
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="lg" className="w-full sm:w-auto" onClick={handleSaveToggle}>
                      <Bookmark className={cn("size-4 mr-2", saved && "fill-current")} aria-hidden="true" />
                      {saved ? "Saved" : "Save"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    {saved ? "Remove from saved" : "Save for later"}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="lg" className="w-full sm:w-auto" onClick={handleShare}>
                      <Share2 className="size-4 mr-2" aria-hidden="true" />
                      Share
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    Share destination
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="places">Top Places</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="practical">Practical Info</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-xl font-bold text-foreground">About {destination.city}</h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
                {destination.description}
              </p>
            </section>

            <section aria-labelledby="quick-info-heading">
              <h2 id="quick-info-heading" className="text-xl font-bold text-foreground">Quick Information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard icon={<CalendarDays className="size-5" />} label="Best Time to Visit" value={destination.bestTimeToVisit} />
                <InfoCard icon={<Clock className="size-5" />} label="Recommended Duration" value={destination.recommendedDuration} />
                <InfoCard icon={<MapPin className="size-5" />} label="Estimated Budget" value={estimatedBudget} description="for recommended duration" />
                <InfoCard icon={<Star className="size-5" />} label="Average Rating" value={`${destination.rating.toFixed(1)} / 5.0`} description={`${destination.reviews.toLocaleString()} reviews`} />
              </div>
            </section>

            <section aria-labelledby="categories-heading">
              <h2 id="categories-heading" className="text-xl font-bold text-foreground">Travel Categories</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {destination.tags.map((tag) => {
                  const Icon = CATEGORY_ICONS[tag] || Loader;
                  return (
                    <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-subtle-border bg-card px-3 py-1 text-sm font-medium text-foreground">
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                      {tag.charAt(0).toUpperCase() + tag.slice(1)}
                    </span>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="nearby-heading">
              <h2 id="nearby-heading" className="text-xl font-bold text-foreground">
                Nearby Destinations
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Other popular spots in {destination.country}
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getNearbyDestinations(destination).map((dest) => (
                  <DestinationCardCompact key={dest.id} destination={dest} />
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="places" className="space-y-6">
            {topPlaces.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topPlaces.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No top places data available for this destination.
              </div>
            )}
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            {popularActivities.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {popularActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} destinationId={destination.id} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No activities data available for this destination.
              </div>
            )}
          </TabsContent>

          <TabsContent value="practical" className="space-y-8">
            <section aria-labelledby="best-time-heading">
              <h2 id="best-time-heading" className="text-xl font-bold text-foreground">Best Time to Visit</h2>
              <p className="mt-2 text-base text-muted-foreground">{destination.bestTimeToVisit}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {getSeasonalInfo().map((season) => (
                  <SeasonCard key={season.months} {...season} />
                ))}
              </div>
            </section>

            <section aria-labelledby="budget-heading">
              <h2 id="budget-heading" className="text-xl font-bold text-foreground">Budget Guide</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {budgetTiers.map((tier) => (
                  <BudgetTierCard key={tier.id} tier={tier} destination={destination} />
                ))}
              </div>
            </section>

            <section aria-labelledby="getting-there-heading">
              <h2 id="getting-there-heading" className="text-xl font-bold text-foreground">Getting There</h2>
              <div className="mt-4 space-y-3">
                <p className="text-muted-foreground">
                  Major international airports serve {destination.city}. Check flight aggregators for the best routes from your location.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-subtle-border bg-card p-4">
                    <h3 className="font-medium text-foreground">By Air</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Fly into the main international airport. Local transfers available via taxi, rideshare, or public transport.
                    </p>
                  </div>
                  <div className="rounded-lg border border-subtle-border bg-card p-4">
                    <h3 className="font-medium text-foreground">Local Transport</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Public transit, taxis, and rideshares are widely available. Consider renting a vehicle for exploring beyond the city.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section aria-labelledby="tips-heading">
              <h2 id="tips-heading" className="text-xl font-bold text-foreground">Travel Tips</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">• Learn a few basic phrases in the local language</li>
                <li className="flex items-start gap-2">• Check visa requirements for your nationality</li>
                <li className="flex items-start gap-2">• Carry both cash and cards; smaller establishments may prefer cash</li>
                <li className="flex items-start gap-2">• Respect local customs and dress codes, especially at religious sites</li>
                <li className="flex items-start gap-2">• Stay hydrated and use sunscreen in tropical climates</li>
                <li className="flex items-start gap-2">• Purchase travel insurance before departure</li>
              </ul>
            </section>
          </TabsContent>
        </Tabs>

        {/* Mobile Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden animate-slide-up">
          <div className="mx-auto max-w-4xl px-4 pb-safe">
            <div className="rounded-t-2xl border border-subtle-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-xl shadow-black/10">
              <div className="flex items-center gap-3">
                <Button asChild variant="secondary" className="flex-1">
                  <Link to={`/trips/create?destination=${destination.id}`}>
                    <Plus className="size-4 mr-2" aria-hidden="true" />
                    Plan Trip
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleAddToTrip} className="flex-1">
                  <Plus className="size-4 mr-2" aria-hidden="true" />
                  Add to Trip
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleSaveToggle} className="size-10">
                      <Bookmark className="size-5" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{saved ? "Saved" : "Save"}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        <AddToTripDialog
          open={addToTripOpen}
          onOpenChange={setAddToTripOpen}
          destinationId={destination.id}
          destinationName={destination.city}
        />
      </div>
    </TooltipProvider>
  );
}

/* Helper Components */
function InfoCard({ icon, label, value, description }: { icon: React.ReactNode; label: string; value: string; description?: string }) {
  return (
    <div className="rounded-xl border border-subtle-border bg-card p-4">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

function SeasonCard({ season, months, description }: BestTimeData) {
  const Icon = MONTH_ICONS[season.toLowerCase() as keyof typeof MONTH_ICONS] || Sun;
  return (
    <div className="rounded-lg border border-subtle-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        <span className="font-medium text-foreground">{season}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{months}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function BudgetTierCard({ tier, destination }: { tier: LocalBudgetTier; destination: ExploreDestination }) {
  const dailyCost = destination.estimatedDailyCostInr * tier.costMultiplier!;
  const duration = parseInt(destination.recommendedDuration.split("–")[1] || destination.recommendedDuration);
  const total = dailyCost * duration;

  return (
    <div className="rounded-lg border border-subtle-border bg-card p-4">
      <h3 className="font-semibold text-foreground">{tier.label}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Daily estimate</span>
          <span className="font-medium text-foreground">{formatMoneyRaw(dailyCost, "INR")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total ({duration} days)</span>
          <span className="font-semibold text-primary">{formatMoneyRaw(total, "INR")}</span>
        </div>
      </div>
    </div>
  );
}

function PlaceCard({ place }: { place: PlaceCard }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-subtle-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/explore/destinations/${place.destinationId}?place=${place.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={place.image}
            alt={place.imageAlt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-x-3 bottom-3 text-white">
            <h3 className="font-semibold">{place.name}</h3>
            <p className="text-sm text-white/80">{place.category}</p>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>
        <Button asChild variant="outline" size="sm" className="mt-3 w-full">
          <Link to={`/explore/destinations/${place.destinationId}?place=${place.id}`}>
            View Details
            <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function ActivityCard({ activity, destinationId }: { activity: ExploreActivity; destinationId: string }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-subtle-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={activity.image}
          alt={activity.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{activity.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {activity.durationHours}h
          </span>
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-warning-text text-warning-text" aria-hidden="true" />
            {activity.rating?.toFixed(1) ?? "—"}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden="true" />
            {activity.location}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-subtle-border pt-3">
          <span className="font-medium text-foreground">{formatMoneyRaw(activity.costInr, "INR")}</span>
          <Button asChild variant="outline" size="sm">
            <Link to={`/explore/destinations/${destinationId}?activity=${activity.id}`}>
              View Details
              <ArrowRight className="size-3.5 ml-1" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function DestinationCardCompact({ destination }: { destination: ExploreDestination }) {
  return (
    <Link
      to={`/explore/destinations/${destination.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-subtle-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={destination.image}
          alt={destination.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-3 bottom-3 text-white">
          <h3 className="font-semibold">{destination.city}</h3>
          <p className="text-sm text-white/80">{destination.country}</p>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{destination.description}</p>
      </div>
    </Link>
  );
}

function getNearbyDestinations(_destination: ExploreDestination): ExploreDestination[] {
  return exploreDestinations
    .filter((d) => d.country === _destination.country && d.id !== _destination.id)
    .slice(0, 3);
}

function getSeasonalInfo(): BestTimeData[] {
  return [
    { season: "Spring", months: "Mar – May", description: "Mild weather, blooming landscapes, fewer crowds" },
    { season: "Summer", months: "Jun – Aug", description: "Peak season, warm weather, vibrant atmosphere" },
    { season: "Autumn", months: "Sep – Nov", description: "Comfortable temperatures, beautiful foliage" },
    { season: "Winter", months: "Dec – Feb", description: "Cooler weather, potential for winter activities" },
  ];
}

const budgetTiers: LocalBudgetTier[] = [
  { id: "budget", label: "Budget", description: "Hostels, street food, public transport", costMultiplier: 0.6 },
  { id: "moderate", label: "Moderate", description: "Comfortable stays, some splurges", costMultiplier: 1.0 },
  { id: "premium", label: "Premium", description: "Boutique hotels, fine dining, private tours", costMultiplier: 1.8 },
];

import { exploreDestinations } from "@/features/explore/explore.data";

export default DestinationDetailsPage;