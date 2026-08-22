import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, Wallet, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { formatMoney } from "@/features/trips/trips.utils";
import { itineraryTotals, categoryTotals } from "@/features/trips/trip-details.logic";
import type { ItineraryRecord } from "@/features/trips/itinerary.types";
import type { TripRecord } from "@/features/trips/trips.types";

interface BudgetTabProps {
  trip: TripRecord;
  itinerary: ItineraryRecord | null | undefined;
}

export function BudgetTab({ trip, itinerary }: BudgetTabProps) {
  const totals = useMemo(
    () => itineraryTotals(itinerary ?? { tripId: "", stops: [], days: [], activities: [], updatedAt: "" }),
    [itinerary]
  );
  const budget = trip.budgetAmount;
  const spent = totals.totalCostInr;
  const remaining = budget - spent;
  const usedPercent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isOver = spent > budget;
  const isWarning = usedPercent >= 80 && !isOver;
  const categories = categoryTotals(itinerary?.activities ?? []);

  return (
    <section aria-label="Budget" className="space-y-6">
      <Card className={isOver ? "border-destructive/30 bg-destructive/5" : isWarning ? "border-amber-500/30 bg-amber-50/50" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-primary" aria-hidden="true" />
              Trip budget
            </CardTitle>
            <Badge
              variant={isOver ? "secondary" : isWarning ? "secondary" : "default"}
              className="gap-1"
            >
              {isOver ? (
                <>
                  <XCircle className="h-3 w-3" aria-hidden="true" />
                  Over budget
                </>
              ) : isWarning ? (
                <>
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  {usedPercent}% used
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  On track
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <BudgetStat
              label="Total budget"
              value={formatMoney(budget, trip.currency)}
              icon={<CreditCard className="h-5 w-5 text-primary" />}
            />
            <BudgetStat
              label="Planned spend"
              value={formatMoney(spent, trip.currency)}
              icon={<Wallet className="h-5 w-5" />}
            />
            <BudgetStat
              label={isOver ? "Over budget" : "Remaining"}
              value={formatMoney(Math.abs(remaining), trip.currency)}
              icon={
                isOver ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )
              }
              variant={isOver ? "destructive" : "default"}
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-foreground">Budget utilization</span>
              <span className="font-mono text-muted-foreground">{usedPercent}%</span>
            </div>
            <Progress
              value={Math.min(usedPercent, 100)}
              max={100}
              className="h-3"
              aria-label={`Budget ${usedPercent}% used`}
            />
            {isOver && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Over budget by {formatMoney(spent - budget, trip.currency)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
              Spend by category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((cat) => (
                <CategoryBar key={cat.category} category={cat} trip={trip} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {itinerary && itinerary.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Activity</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Day</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Cost</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {itinerary.activities
                    .sort((a, b) => b.estimatedCostInr - a.estimatedCostInr)
                    .map((activity) => (
                      <tr key={activity.id} className="border-b border-border/50 hover:bg-accent/30">
                        <td className="py-3 px-3">
                          <p className="font-medium text-foreground truncate max-w-xs">{activity.name}</p>
                          {activity.location && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {activity.location}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          Day {activity.dayId}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-foreground">
                          {formatMoney(activity.estimatedCostInr, trip.currency)}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="gap-1 h-5 px-2">
                            {activity.category}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50">
                    <td className="py-3 px-3 font-semibold text-foreground">Total</td>
                    <td className="py-3 px-3"></td>
                    <td className="py-3 px-3 text-right font-semibold font-mono text-foreground">
                      {formatMoney(spent, trip.currency)}
                    </td>
                    <td className="py-3 px-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-info/30 bg-info/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">Estimated costs only</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This budget view shows planned activity estimates from your itinerary.
                Actual expense tracking, receipts, and real-time spend sync are not wired yet.
                Connect a real expense service to enable live budget monitoring.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function BudgetStat({
  label,
  value,
  icon,
  variant = "default",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: "default" | "destructive";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`text-foreground ${variant === "destructive" && "text-destructive"}`}>
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function CategoryBar({
  category,
  trip,
}: {
  category: ReturnType<typeof categoryTotals>[0];
  trip: TripRecord;
}) {
  const percent = trip.budgetAmount > 0 ? (category.costInr / trip.budgetAmount) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground truncate max-w-[200px]">{category.label}</span>
        <span className="font-mono text-muted-foreground">{formatMoney(category.costInr, trip.currency)}</span>
      </div>
      <Progress
        value={Math.min(percent, 100)}
        max={100}
        className="h-2"
        aria-label={`${category.label} ${percent.toFixed(0)}% of budget`}
      />
    </div>
  );
}