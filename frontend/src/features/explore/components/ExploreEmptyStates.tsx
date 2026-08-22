import { Link } from "react-router-dom";
import { Search, Filter, Globe, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NoResultsStateProps {
  onClearFilters?: () => void;
  hasFilters?: boolean;
  query?: string;
}

export function NoResultsState({ onClearFilters, hasFilters, query }: NoResultsStateProps) {
  return (
    <div className="py-16 px-4 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
          <Search className="size-10 text-muted-foreground" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {query ? `No results for &ldquo;${query}&rdquo;` : "No destinations found"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters
              ? "Try adjusting your filters or search terms."
              : "We couldn&apos;t find any destinations matching your criteria."}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          {hasFilters && onClearFilters && (
            <Button variant="outline" onClick={onClearFilters} className="w-full">
              <Filter className="size-4 mr-2" aria-hidden="true" />
              Clear All Filters
            </Button>
          )}
          {query && (
            <Button variant="ghost" onClick={() => onClearFilters?.()} className="w-full">
              Try a different search
            </Button>
          )}
          <Button asChild variant="secondary" className="w-full">
            <Link to="/explore">
              <Globe className="size-4 mr-2" aria-hidden="true" />
              Browse All Destinations
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", description, onRetry }: ErrorStateProps) {
  return (
    <div className="py-16 px-4 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10">
          <Globe className="size-10 text-destructive" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {description ?? "We couldn&apos;t load the destinations. Please check your connection and try again."}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              <Search className="size-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
          )}
          <Button asChild variant="secondary" className="w-full">
            <Link to="/explore">
              <Globe className="size-4 mr-2" aria-hidden="true" />
              Browse Destinations
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function ExploreEmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="py-16 px-4 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
          {icon ?? (
            <Globe className="size-10 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick} className="w-full max-w-xs">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty state for when user has no trips (for Add to Trip dialog)
 */
export function NoTripsEmptyState({
  onCreateTrip,
}: {
  onCreateTrip: () => void;
}) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
        <PlusCircle className="size-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">No trips yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Create your first trip to start adding destinations.
      </p>
      <Button onClick={onCreateTrip} className="mt-4 w-full max-w-xs">
        <PlusCircle className="size-4 mr-2" aria-hidden="true" />
        Create New Trip
      </Button>
    </div>
  );
}