import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <Card className="shadow-sm shadow-black/5 dark:shadow-black/20">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <AuthHeader
            title="Forgot Password?"
            description="Reset Your Account Password"
          />
          <ForgotPasswordForm />
          <Separator />
          <p className="text-center text-xs text-muted-foreground">
            For your security we never reveal whether an email address is
            registered.
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
