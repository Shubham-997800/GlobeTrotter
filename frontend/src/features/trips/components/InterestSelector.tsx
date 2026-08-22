import {
  Building2,
  Landmark,
  Leaf,
  Mountain,
  Music,
  Palmtree,
  Palette,
  ShoppingBag,
  Tent,
  UtensilsCrossed,
  Waves,
} from "lucide-react";

import { interestCatalog } from "../trips.data";
import type { InterestId } from "../trips.types";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const INTEREST_ICONS: Record<InterestId, React.ComponentType<{ className?: string }>> = {
  adventure: Tent,
  nature: Leaf,
  food: UtensilsCrossed,
  culture: Palette,
  history: Landmark,
  beaches: Waves,
  mountains: Mountain,
  nightlife: Music,
  shopping: ShoppingBag,
  relaxation: Palmtree,
  "city-life": Building2,
};

interface InterestSelectorProps {
  selected: InterestId[];
  onToggle: (id: InterestId) => void;
  disabled?: boolean;
}

/**
 * Multi-select interest chips backed by real checkboxes so screen
 * readers announce state; visual chips are just styling.
 */
export function InterestSelector({
  selected,
  onToggle,
  disabled,
}: InterestSelectorProps) {
  return (
    <fieldset>
      <legend className="sr-only">Trip interests</legend>
      <div className="flex flex-wrap gap-2">
        {interestCatalog.map((interest) => {
          const Icon = INTEREST_ICONS[interest.id];
          const checked = selected.includes(interest.id);
          const checkboxId = `interest-${interest.id}`;
          return (
            <div key={interest.id}>
              <Checkbox
                id={checkboxId}
                className="peer sr-only"
                checked={checked}
                disabled={disabled}
                onCheckedChange={() => onToggle(interest.id)}
              />
              <Label
                htmlFor={checkboxId}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                  checked
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-strong-border hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {interest.label}
                <span className="sr-only">
                  {checked ? "(selected)" : "(not selected)"}
                </span>
              </Label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
