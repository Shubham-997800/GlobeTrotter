import { Navigate } from "react-router-dom";

import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FullScreenLoader } from "@/features/auth/ProtectedRoute";
import { useAuth } from "@/features/auth/useAuth";
import { landingConfig } from "@/config/landing.config";

export function SignupPage() {
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
            title="Create your account"
            description={`Get started with ${landingConfig.appName} in seconds.`}
          />
          <SignupForm />
          <Separator />
          <AuthFooter variant="signup" />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
