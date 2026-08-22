import { Navigate } from "react-router-dom";

import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FullScreenLoader } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/useAuth";

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <AuthLayout>
      <Card className="shadow-sm shadow-black/5 dark:shadow-black/20">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <AuthHeader
            title="Welcome back"
            description="Sign in to continue to your workspace."
          />
          <LoginForm />
          <Separator />
          <AuthFooter variant="login" />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
