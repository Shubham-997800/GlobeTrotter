import { LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MyTripsViewMode } from "../../trips.types";

const OPTIONS: {
  value: MyTripsViewMode;
  label: string;
  icon: typeof List;
}[] = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
];

export function ViewToggle({
  value,
  onChange,
}: {
  value: MyTripsViewMode;
  onChange: (next: MyTripsViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Trip layout"
      className="inline-flex items-center rounded-lg border border-border bg-muted p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <Button
            key={option.value}
            variant="ghost"
            size="icon"
            aria-pressed={active}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "size-8 rounded-md",
              active
                ? "bg-card text-foreground shadow-sm hover:bg-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <option.icon className="size-4" aria-hidden="true" />
          </Button>
        );
      })}
    </div>
  );
}
