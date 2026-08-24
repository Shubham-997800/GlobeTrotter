import { Shield, ShieldCheck, Users, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/useAuth";

const PERMISSIONS = [
  { role: "admin", permissions: ["View all users", "Manage user roles", "View all trips", "Manage destinations", "Manage activities", "View analytics", "Access admin dashboard", "View activity feed"] },
  { role: "user", permissions: ["View own profile", "Create trips", "Manage own trips", "Explore destinations", "Save destinations", "View notifications"] },
];

export function AdminRolesPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>

      {/* Current role info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Your Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant={user?.role === "admin" ? "default" : "secondary"} className="text-sm">
              {user?.role ?? "user"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {user?.role === "admin"
                ? "You have full administrative access to the system."
                : "You have standard user access."}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Role cards */}
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
              <ul className="space-y-2">
                {rolePerm.permissions.map((perm) => (
                  <li key={perm} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {perm}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Authorization notice */}
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
