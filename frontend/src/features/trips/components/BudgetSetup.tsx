import { Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { budgetTiers, currencies } from "../trips.data";
import type { BudgetTierDef } from "../trips.types";
import { formatMoney } from "../trips.utils";
import { cn } from "@/lib/utils";

interface BudgetSetupProps {
  tier: string;
  currency: string;
  amount: string;
  onTierChange: (tier: BudgetTierDef["id"]) => void;
  onCurrencyChange: (code: string) => void;
  onAmountChange: (amount: string) => void;
  /** For the estimate caption: destination daily cost in INR. */
  estimateInr: number | null;
  durationDays: number | null;
  error?: string;
  disabled?: boolean;
}

const TIER_HINTS: Record<string, string> = {
  budget: "Hostels and street food",
  moderate: "Comfortable stays",
  premium: "Boutique and fine dining",
  custom: "You decide the total",
};

/**
 * Budget tier radio group + total + currency. The spending estimate is
 * a transparent heuristic (daily cost × days × tier multiplier), never
 * presented as authoritative pricing.
 */
export function BudgetSetup({
  tier,
  currency,
  amount,
  onTierChange,
  onCurrencyChange,
  onAmountChange,
  estimateInr,
  durationDays,
  error,
  disabled,
}: BudgetSetupProps) {
  const activeTier =
    budgetTiers.find((candidate) => candidate.id === tier) ??
    budgetTiers.find((candidate) => candidate.id === "custom")!;

  return (
    <div className="space-y-4">
      {/* Tier picker */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">
          Travel style
        </legend>
        <div
          role="radiogroup"
          aria-label="Budget tier"
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
        >
          {budgetTiers.map((candidate) => {
            const checked = candidate.id === tier;
            return (
              <label key={candidate.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="budget-tier"
                  value={candidate.id}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onTierChange(candidate.id)}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "flex h-full flex-col gap-0.5 rounded-xl border p-3 transition-colors",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                    checked
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card hover:border-strong-border",
                  )}
                >
                  <span className="text-sm font-semibold">{candidate.label}</span>
                  <span className="text-xs leading-snug text-muted-foreground">
                    {candidate.description || TIER_HINTS[candidate.id]}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Total + currency */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="trip-budget">Total budget</Label>
          <div className="flex gap-2">
            <Input
              id="trip-budget"
              inputMode="decimal"
              placeholder="e.g. 150000"
              value={amount}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? "trip-budget-error" : estimateInr !== null && durationDays
                  ? "trip-budget-hint"
                  : undefined
              }
              onChange={(event) => {
                // Digits + one decimal point only.
                const sanitized = event.target.value.replace(/[^\d.]/g, "");
                onAmountChange(sanitized);
              }}
            />
            <Select
              value={currency}
              onValueChange={onCurrencyChange}
              disabled={disabled}
            >
              <SelectTrigger
                aria-label="Currency"
                className="w-28 shrink-0 bg-card"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((option) => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.symbol} {option.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error ? (
            <p id="trip-budget-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        {/* Transparent heuristic — labeled as an estimate. */}
        <div
          id="trip-budget-hint"
          className="flex items-start gap-2 rounded-xl border border-subtle-border bg-muted/50 p-3 sm:max-w-xs"
        >
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {estimateInr !== null && durationDays ? (
              <>
                Rough estimate for this trip:{" "}
                <span className="font-semibold text-foreground">
                  {formatMoney(estimateInr, currency)}
                </span>{" "}
                ({activeTier.label.toLowerCase()} style · {durationDays}{" "}
                {durationDays === 1 ? "day" : "days"}). Demo conversion rates.
              </>
            ) : (
              <>
                Pick dates and a destination to see a rough spending estimate
                for your travel style. Demo conversion rates.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Category split preview for the chosen tier */}
      <SplitPreview tier={activeTier} />
    </div>
  );
}

function SplitPreview({ tier }: { tier: BudgetTierDef }) {
  const entries = Object.entries(tier.split) as [
    keyof BudgetTierDef["split"],
    number,
  ][];

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full border border-subtle-border">
        {entries.map(([category, percent]) => (
          <span
            key={category}
            style={{ width: `${percent}%` }}
            title={`${category} ${percent}%`}
            className={cn(
              category === "stay" && "bg-primary",
              category === "transport" && "bg-primary/70",
              category === "activities" && "bg-primary/45",
              category === "food" && "bg-primary/25",
              category === "other" && "bg-muted",
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {entries.map(([category, percent]) => (
          <span
            key={category}
            className="inline-flex items-center gap-1.5 text-xs capitalize text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className={cn(
                "h-2 w-2 rounded-full",
                category === "stay" && "bg-primary",
                category === "transport" && "bg-primary/70",
                category === "activities" && "bg-primary/45",
                category === "food" && "bg-primary/25",
                category === "other" && "bg-muted",
              )}
            />
            {category} · {percent}%
          </span>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Default {tier.label.toLowerCase()} split — adjust anytime in the itinerary builder.
      </p>
    </div>
  );
}
