import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";

import App from "@/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatusProvider } from "@/hooks/useNetworkStatus";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { queryClient } from "@/lib/query-client";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ErrorBoundary>
          <NetworkStatusProvider>
            <App />
          </NetworkStatusProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);