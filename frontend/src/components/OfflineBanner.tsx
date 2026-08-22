import { useEffect, useState } from "react";
import { WifiOff, Loader2 } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
    } else if (wasOffline) {
      setShowBanner(true);
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!showBanner) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-destructive bg-destructive text-destructive-foreground",
        "transition-transform duration-300 ease-out",
        isOnline ? "translate-y-0" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex h-10 max-w-6xl items-center justify-center gap-2 px-4 text-sm font-medium">
        <WifiOff className="h-4 w-4 shrink-0 animate-pulse" aria-hidden="true" />
        <span>
          {isOnline
            ? "Connection restored. You're back online."
            : "You're offline. Some features may be limited."}
        </span>
        {!isOnline && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}