import { useCallback } from "react";

import { cn } from "@/lib/utils";
import type { CategoryFilter } from "../explore.types";

const CATEGORIES: { id: CategoryFilter; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "🌍" },
  { id: "adventure", label: "Adventure", icon: "🏔️" },
  { id: "nature", label: "Nature", icon: "🌲" },
  { id: "beaches", label: "Beaches", icon: "🏖️" },
  { id: "mountains", label: "Mountains", icon: "⛰️" },
  { id: "culture", label: "Culture", icon: "🏛️" },
  { id: "food", label: "Food", icon: "🍜" },
  { id: "history", label: "History", icon: "📜" },
  { id: "city-life", label: "City Life", icon: "🏙️" },
  { id: "nightlife", label: "Nightlife", icon: "🌃" },
  { id: "relaxation", label: "Relaxation", icon: "🧘" },
];

interface ExploreCategoriesProps {
  /** Active category from URL or state */
  activeCategory: CategoryFilter;
  /** Callback when category changes */
  onCategoryChange: (category: CategoryFilter) => void;
  /** Whether to show as tabs or chips */
  variant?: "tabs" | "chips";
  /** Additional className */
  className?: string;
}

export function ExploreCategories({
  activeCategory,
  onCategoryChange,
  variant = "tabs",
  className,
}: ExploreCategoriesProps) {
  const handleCategoryClick = useCallback(
    (category: CategoryFilter) => {
      onCategoryChange(category);
    },
    [onCategoryChange]
  );

  if (variant === "chips") {
    return (
      <div
        role="radiogroup"
        aria-label="Filter by category"
        className={cn("flex flex-wrap gap-2", className)}
      >
        {CATEGORIES.map((cat) => {
          const selected = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => handleCategoryClick(cat.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-subtle-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <span aria-hidden="true">{cat.icon}</span>
              {cat.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
      <div
        role="radiogroup"
        aria-label="Filter by category"
        className={cn("flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      >
        {CATEGORIES.map((cat) => {
          const selected = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={selected}
            onClick={() => handleCategoryClick(cat.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-subtle-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <span aria-hidden="true">{cat.icon}</span>
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Mobile category pills - horizontal scrolling with snap
 */
export function MobileCategoryPills({
  activeCategory,
  onCategoryChange,
  className,
}: Pick<ExploreCategoriesProps, "activeCategory" | "onCategoryChange" | "className">) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter by category"
      className={cn("flex gap-2 overflow-x-auto pb-1 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x", className)}
    >
      {CATEGORIES.map((cat) => {
        const selected = cat.id === activeCategory;
        return (
          <button
            key={cat.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all snap-center",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-subtle-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            <span aria-hidden="true">{cat.icon}</span>
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}