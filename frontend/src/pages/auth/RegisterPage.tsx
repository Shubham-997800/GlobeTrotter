import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { landingConfig } from "@/config/landing.config";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function RegisterPage() {
  return (
    <AuthLayout wide>
      <Card className="shadow-sm shadow-black/5 dark:shadow-black/20">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <AuthHeader
            title="Create Your Account"
            description={`Start Planning Your Journey with ${landingConfig.appName}.`}
          />
          <RegisterForm />
          <Separator />
          <AuthFooter variant="signup" />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
