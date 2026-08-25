import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AdminRegisterForm } from "@/components/auth/AdminRegisterForm";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export function AdminRegisterPage() {
  return (
    <AuthLayout wide>
      <Card className="shadow-sm shadow-black/5 dark:shadow-black/20">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <AuthHeader
            title="Create Admin Account"
            description="Register as an administrator to access the management console, analytics, and user administration."
          />
          <AdminRegisterForm />
          <Separator />
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Need a regular account?{" "}
              <Link
                to="/register"
                className="rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                Create User Account
              </Link>
            </p>
            <AuthFooter variant="signup" />
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
