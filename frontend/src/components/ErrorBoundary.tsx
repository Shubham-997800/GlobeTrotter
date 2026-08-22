import { Component, type ReactNode, type ErrorInfo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-dvh flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md shadow-lg shadow-black/10">
            <CardContent className="p-8 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We caught an unexpected error. Your data is safe — try refreshing the page.
                </p>
              </div>
              {this.state.error && (
                <details className="text-left space-y-2">
                  <summary className="text-xs font-medium text-muted-foreground cursor-pointer">
                    Error details
                  </summary>
                  <pre className="rounded-md bg-muted p-3 text-xs text-muted-foreground overflow-auto max-h-40">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Try Again
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/dashboard">
                    <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}