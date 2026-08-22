import { Link, useLocation } from "react-router-dom";
import { Home, RefreshCw, WifiOff, Lock, AlertTriangle, Server } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ErrorType = "404" | "403" | "500" | "maintenance" | "network";

const ERROR_CONFIG: Record<
  ErrorType,
  {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    primaryAction?: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
    secondaryAction?: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  }
> = {
  404: {
    icon: AlertTriangle,
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved. Double-check the URL or head back to safety.",
    primaryAction: { label: "Back to Dashboard", href: "/dashboard", icon: Home },
    secondaryAction: { label: "Explore Destinations", href: "/explore", icon: RefreshCw },
  },
  403: {
    icon: Lock,
    title: "Access Denied",
    description: "You don't have permission to view this page. If you think this is a mistake, contact support.",
    primaryAction: { label: "Go Back", href: "/dashboard", icon: Home },
  },
  500: {
    icon: Server,
    title: "Server Error",
    description: "Something went wrong on our end. Our team has been notified. Please try again in a moment.",
    primaryAction: { label: "Retry", href: "", icon: RefreshCw },
    secondaryAction: { label: "Back to Dashboard", href: "/dashboard", icon: Home },
  },
  maintenance: {
    icon: WifiOff,
    title: "Maintenance Mode",
    description: "We're making improvements to GlobeTrotter. The app will be back shortly. Thanks for your patience!",
    primaryAction: { label: "Try Again", href: "", icon: RefreshCw },
  },
  network: {
    icon: WifiOff,
    title: "You're Offline",
    description: "No internet connection detected. Check your network and try again. Some features may work with cached data.",
    primaryAction: { label: "Retry Connection", href: "", icon: RefreshCw },
  },
};

interface SystemErrorPageProps {
  type: ErrorType;
}

export function SystemErrorPage({ type }: SystemErrorPageProps) {
  const location = useLocation();
  const config = ERROR_CONFIG[type];

  const handlePrimaryAction = () => {
    if (config.primaryAction?.href) {
      window.location.href = config.primaryAction.href;
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg shadow-black/10">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <config.icon className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{type === "404" ? "404" : type === "403" ? "403" : type === "500" ? "500" : ""}</h1>
            <h2 className="mt-2 text-xl font-bold text-foreground">{config.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{config.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handlePrimaryAction} className="flex-1">
              {config.primaryAction?.icon && <config.primaryAction.icon className="h-4 w-4 mr-2" aria-hidden="true" />}
              {config.primaryAction?.label}
            </Button>
            {config.secondaryAction && (
              <Button asChild variant="outline" className="flex-1">
                <Link to={config.secondaryAction!.href}>
                  {config.secondaryAction.icon && <config.secondaryAction.icon className="h-4 w-4 mr-2" aria-hidden="true" />}
                  {config.secondaryAction.label}
                </Link>
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Path: <code className="font-mono">{location.pathname}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function NotFoundPage() {
  return <SystemErrorPage type="404" />;
}

export function ForbiddenPage() {
  return <SystemErrorPage type="403" />;
}

export function ServerErrorPage() {
  return <SystemErrorPage type="500" />;
}

export function MaintenancePage() {
  return <SystemErrorPage type="maintenance" />;
}

export function NetworkErrorPage() {
  return <SystemErrorPage type="network" />;
}