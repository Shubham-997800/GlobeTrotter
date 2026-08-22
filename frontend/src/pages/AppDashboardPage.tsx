import { AppShell } from "@/components/layout/AppShell";
import {
  RegionalSelections,
} from "@/features/dashboard/components/RegionalSelections";
import {
  PopularDestinations,
} from "@/features/dashboard/components/PopularDestinations";
import {
  TravelBanner,
} from "@/features/dashboard/components/TravelBanner";
import {
  TravelInsights,
} from "@/features/dashboard/components/TravelInsights";
import {
  TripOverview,
} from "@/features/dashboard/components/TripOverview";
import {
  QuickActions,
} from "@/features/dashboard/components/QuickActions";
import {
  RecentActivity,
} from "@/features/dashboard/components/RecentActivity";
import {
  WelcomeSection,
} from "@/features/dashboard/components/WelcomeSection";
import {
  DashboardSkeleton,
  ErrorState,
} from "@/features/dashboard/components/States";
import {
  useDashboardData,
  useSavedDestinationIds,
  useToggleSavedDestination,
} from "@/features/dashboard/useDashboard";

export function AppDashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboardData();
  const { data: savedIds = [] } = useSavedDestinationIds();
  const toggleSaved = useToggleSavedDestination();

  return (
    <AppShell
      crumbs={[{ label: "Home", to: "/dashboard" }, { label: "Dashboard" }]}
      notifications={data?.notifications ?? []}
    >
      <div className="space-y-10">
        {isLoading ? (
          <DashboardSkeleton />
        ) : isError || !data ? (
          <ErrorState
            title="Couldn't load your dashboard"
            description="We had trouble fetching your trips and recommendations. Give it another go."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <WelcomeSection />
            <TravelBanner slides={data.featuredSlides} />
            <RegionalSelections />
            <PopularDestinations
              destinations={data.destinations}
              savedIds={savedIds}
              onToggleSaved={(id) => toggleSaved.mutate(id)}
            />
            <TripOverview trips={data.myTrips} />
            <QuickActions />

            {/* Activity feed beside insights on wide screens */}
            <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
              <RecentActivity />
              <TravelInsights />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
