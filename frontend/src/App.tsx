import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@/features/auth/AuthContext";
import { GuestRoute } from "@/features/auth/GuestRoute";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AppSectionPlaceholder } from "@/pages/AppSectionPlaceholder";

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
const ItineraryBuilderPage = lazy(() =>
  import("@/pages/trips/ItineraryBuilderPage").then((m) => ({ default: m.default })),
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

const queryClient = new QueryClient();

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

/** Signed-in-only modules awaiting their dedicated screens. */
const APP_SECTIONS = [
  {
    path: "/community",
    title: "Community",
    description:
      "See journeys shared by travelers like you and get inspired for your next trip.",
  },
  {
    path: "/calendar",
    title: "Travel Calendar",
    description:
      "Visualize every day of every trip on one timeline so nothing is double-booked.",
  },
  {
    path: "/profile",
    title: "Profile",
    description:
      "Manage your account details, avatar and travel preferences.",
  },
  {
    path: "/settings",
    title: "Settings",
    description:
      "Tune notifications, currency, privacy and other app preferences.",
  },
] as const;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
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
                  <AppDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/app" element={<Navigate to="/dashboard" replace />} />
            {APP_SECTIONS.map((section) => (
              <Route
                key={section.path}
                path={section.path}
                element={
                  <ProtectedRoute>
                    <AppSectionPlaceholder
                      title={section.title}
                      description={section.description}
                    />
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Trips module */}
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <MyTripsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/create"
              element={
                <ProtectedRoute>
                  <CreateTripPage />
                </ProtectedRoute>
              }
            />
            {/* Alias matching the sidebar CTA slug */}
            <Route
              path="/app/create-trip"
              element={<Navigate to="/trips/create" replace />}
            />
            <Route
              path="/trips/:tripId/itinerary"
              element={
                <ProtectedRoute>
                  <ItineraryBuilderPage />
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
                  <ExplorePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/explore/destinations/:destinationId"
              element={
                <ProtectedRoute>
                  <DestinationDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/explore/search"
              element={
                <ProtectedRoute>
                  <SearchResultsPage />
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

            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <AppToaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
