import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "neutral";

interface StatTrend {
  value: number;
  direction: TrendDirection;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: StatTrend;
  className?: string;
}

export function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p className={cn(
            "text-xs mt-1 font-medium",
            trend.direction === "up" && "text-emerald-600",
            trend.direction === "down" && "text-red-600",
            trend.direction === "neutral" && "text-muted-foreground",
          )}>
            {trend.direction === "up" && "+"}
            {trend.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
