import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@/features/auth/AuthContext";
import { GuestRoute } from "@/features/auth/GuestRoute";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AppSectionPlaceholder } from "@/pages/AppSectionPlaceholder";
import { AppDashboardPage } from "@/pages/AppDashboardPage";
import { LandingPage } from "@/pages/LandingPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";

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
    path: "/dashboard",
    title: "Dashboard",
    description:
      "Your travel overview — upcoming trips, budgets and recent activity will live here.",
  },
  {
    path: "/trips",
    title: "My Trips",
    description:
      "Browse, organize and revisit every journey you have planned so far.",
  },
  {
    path: "/trips/create",
    title: "Create a Trip",
    description:
      "Pick a destination, set your dates and budget — your itinerary scaffolds itself.",
  },
  {
    path: "/explore",
    title: "Explore",
    description:
      "Discover cities, landmarks and experiences matched to your travel style.",
  },
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
] as const;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
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
              path="/app"
              element={
                <ProtectedRoute>
                  <AppDashboardPage />
                </ProtectedRoute>
              }
            />
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
          <AppToaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
