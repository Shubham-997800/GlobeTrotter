import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function LoginPage() {
  return (
    <AuthLayout>
      <Card className="shadow-sm shadow-black/5 dark:shadow-black/20">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <AuthHeader title="Welcome Back" description="Continue Your Journey" />
          <LoginForm />
          <Separator />
          <AuthFooter variant="login" />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
