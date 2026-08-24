import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff, Loader2 } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

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

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50 border-b border-destructive bg-destructive text-destructive-foreground"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}