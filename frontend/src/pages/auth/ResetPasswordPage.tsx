import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Card className="shadow-sm shadow-black/5 dark:shadow-black/20">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <AuthHeader
            title="Create New Password"
            description="Choose a strong password you haven't used before."
          />
          <ResetPasswordForm />
          <Separator />
          <p className="text-center text-xs text-muted-foreground">
            Reset links expire 15 minutes after they are requested.
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
