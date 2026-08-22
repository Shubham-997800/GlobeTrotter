import type { ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { UserRole } from "./auth.types";
import { useAuth } from "./useAuth";

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  /** When set, the signed-in user must hold one of these roles. */
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (roles && (!user?.role || !roles.includes(user.role))) {
    return <ForbiddenNotice />;
  }

  return <>{children}</>;
}

/**
 * Shown when an authenticated user lacks the required role. Client-side
 * role checks are UX only — real authorization stays on the backend.
 */
function ForbiddenNotice() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light text-primary dark:bg-primary/15">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          Access restricted
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your account doesn&apos;t have permission to view this area. If you
          believe this is a mistake, contact your workspace administrator.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
          <Button onClick={logout}>Sign in with another account</Button>
        </div>
      </div>
    </div>
  );
}
