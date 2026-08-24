import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";

import { AuthProvider } from "@/features/auth/AuthContext";
import { GuestRoute } from "@/features/auth/GuestRoute";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AppSectionPlaceholder } from "@/pages/AppSectionPlaceholder";
import { PageTransition } from "@/components/PageTransition";

// Route-level code splitting — each screen ships in its own chunk so the
// first paint (landing page) never pays for the whole app.
const AppDashboardPage = lazy(() =>
  import("@/pages/AppDashboardPage").then((m) => ({ default: m.AppDashboardPage })),
);
const LandingPage = lazy(() =>
  import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const CreateTripPage = lazy(() =>
  import("@/pages/trips/CreateTripPage").then((m) => ({ default: m.CreateTripPage })),
);
const MyTripsPage = lazy(() =>
  import("@/pages/trips/MyTripsPage").then((m) => ({ default: m.MyTripsPage })),
);
const TripDetailsPage = lazy(() =>
  import("@/pages/trips/TripDetailsPage").then((m) => ({
    default: m.TripDetailsPage,
  })),
);
const BudgetPage = lazy(() =>
  import("@/pages/trips/BudgetPage").then((m) => ({ default: m.BudgetPage })),
);
const ShareTripPage = lazy(() =>
  import("@/pages/trips/ShareTripPage").then((m) => ({
    default: m.ShareTripPage,
  })),
);
const ItineraryBuilderPage = lazy(
  () => import("@/pages/trips/ItineraryBuilderPage"),
);
const ExplorePage = lazy(() =>
  import("@/pages/explore/ExplorePage").then((m) => ({ default: m.ExplorePage })),
);
const DestinationDetailsPage = lazy(() =>
  import("@/pages/explore/DestinationDetailsPage").then((m) => ({ default: m.DestinationDetailsPage })),
);
const SearchResultsPage = lazy(() =>
  import("@/pages/explore/SearchResultsPage").then((m) => ({ default: m.SearchResultsPage })),
);
const CommunityPage = lazy(() =>
  import("@/pages/community/CommunityPage").then((m) => ({
    default: m.CommunityPage,
  })),
);
const CalendarPage = lazy(() =>
  import("@/pages/calendar/CalendarPage").then((m) => ({
    default: m.CalendarPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@/pages/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const NotificationsPage = lazy(() =>
  import("@/pages/notifications/NotificationsPage").then((m) => ({
    default: m.NotificationsPage,
  })),
);
const SavedPage = lazy(() =>
  import("@/pages/SavedPage").then((m) => ({ default: m.SavedPage })),
);
const HelpSupportPage = lazy(() =>
  import("@/pages/HelpSupportPage").then((m) => ({
    default: m.HelpSupportPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("@/pages/auth/ForgotPasswordPage").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const ResetPasswordPage = lazy(() =>
  import("@/pages/auth/ResetPasswordPage").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/SystemErrorPage").then((m) => ({ default: m.NotFoundPage })),
);
const ForbiddenPage = lazy(() =>
  import("@/pages/SystemErrorPage").then((m) => ({ default: m.ForbiddenPage })),
);
const ServerErrorPage = lazy(() =>
  import("@/pages/SystemErrorPage").then((m) => ({ default: m.ServerErrorPage })),
);
const MaintenancePage = lazy(() =>
  import("@/pages/SystemErrorPage").then((m) => ({ default: m.MaintenancePage })),
);
const NetworkErrorPage = lazy(() =>
  import("@/pages/SystemErrorPage").then((m) => ({ default: m.NetworkErrorPage })),
);

function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center bg-background"
    >
      <Loader2
        className="h-7 w-7 animate-spin text-primary"
        aria-hidden="true"
      />
      <span className="sr-only">Loading page…</span>
    </div>
  );
}

function AppToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      richColors
      closeButton
      position="top-right"
    />
  );
}

export default function App() {
  return (
      <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestRoute>
                  <ForgotPasswordPage />
                </GuestRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <GuestRoute>
                  <ResetPasswordPage />
                </GuestRoute>
              }
            />

            {/* Legacy aliases */}
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route
              path="/get-started"
              element={<Navigate to="/register" replace />}
            />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageTransition><AppDashboardPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />

            {/* Community module */}
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <PageTransition><CommunityPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Calendar module */}
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <PageTransition><CalendarPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Profile module */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PageTransition><ProfilePage /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Settings module */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <PageTransition><SettingsPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Notifications */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <PageTransition><NotificationsPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Saved / wishlist */}
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <PageTransition><SavedPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Help & support */}
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <PageTransition><HelpSupportPage /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Trips module */}
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <PageTransition><MyTripsPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/create"
              element={
                <ProtectedRoute>
                  <PageTransition><CreateTripPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Alias matching the sidebar CTA slug */}
            <Route
              path="/app/create-trip"
              element={<Navigate to="/trips/create" replace />}
            />
            <Route
              path="/trips/:tripId"
              element={
                <ProtectedRoute>
                  <PageTransition><TripDetailsPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:tripId/budget"
              element={
                <ProtectedRoute>
                  <PageTransition><BudgetPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:tripId/share"
              element={
                <ProtectedRoute>
                  <PageTransition><ShareTripPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:tripId/itinerary"
              element={
                <ProtectedRoute>
                  <PageTransition><ItineraryBuilderPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            {/* Edit reuses the create form with a loaded record */}
            <Route
              path="/trips/:tripId/edit"
              element={
                <ProtectedRoute>
                  <CreateTripPage />
                </ProtectedRoute>
              }
            />

            {/* Explore module */}
            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <PageTransition><ExplorePage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/explore/destinations/:destinationId"
              element={
                <ProtectedRoute>
                  <PageTransition><DestinationDetailsPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/explore/search"
              element={
                <ProtectedRoute>
                  <PageTransition><SearchResultsPage /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Role protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AppSectionPlaceholder
                    title="Admin Console"
                    description="Workspace administration — users, content moderation and platform settings."
                  />
                </ProtectedRoute>
              }
            />

            {/* System error pages (public) */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/offline" element={<NetworkErrorPage />} />

            <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
          <AppToaster />
      </AuthProvider>
  );
}
