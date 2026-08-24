import { Shield, ShieldCheck, Users, AlertTriangle, Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/useAuth";
import { PageHeader } from "@/components/shared/PageHeader";

const PERMISSIONS = [
  { role: "admin", permissions: ["View all users", "Manage user roles", "View all trips", "Manage destinations", "Manage activities", "View analytics", "Access admin dashboard", "View activity feed"] },
  { role: "user", permissions: ["View own profile", "Create trips", "Manage own trips", "Explore destinations", "Save destinations", "View notifications"] },
];

export function AdminRolesPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="Roles & Permissions" description="Understand access levels and authorization" />

      <Card className="relative overflow-hidden border-2 border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <CardContent className="relative flex flex-col items-center gap-3 py-6 text-center">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Your current role</span>
          <Badge variant={user?.role === "admin" ? "default" : "secondary"} className="px-4 py-1 text-base font-semibold">
            {user?.role ?? "user"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {user?.role === "admin"
              ? "You have full administrative access to the system."
              : "You have standard user access."}
          </span>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {PERMISSIONS.map((rolePerm) => (
          <Card key={rolePerm.role}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 capitalize">
                {rolePerm.role === "admin" ? (
                  <ShieldCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Users className="h-5 w-5 text-muted-foreground" />
                )}
                {rolePerm.role}
              </CardTitle>
              <CardDescription>
                {rolePerm.role === "admin"
                  ? "Full system access with administrative privileges"
                  : "Standard user access to personal features"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {rolePerm.permissions.map((perm) => (
                  <li key={perm} className="flex items-center gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {perm}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">Server-side enforcement</p>
            <p className="text-amber-700 dark:text-amber-300 mt-1">
              All admin API routes are protected by the <code>requireAdmin</code> middleware, which verifies
              the user&apos;s role directly from the database on every request. Frontend-only role checks are
              not sufficient for authorization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
