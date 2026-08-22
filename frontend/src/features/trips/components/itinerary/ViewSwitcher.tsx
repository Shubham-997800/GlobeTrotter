import { CalendarRange, LayoutList, Map } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ViewMode } from "../../itinerary.types";

const VIEWS: Array<{ value: ViewMode; label: string; icon: typeof Map }> = [
  { value: "timeline", label: "Timeline", icon: LayoutList },
  { value: "day", label: "Day", icon: CalendarRange },
  { value: "map", label: "Map", icon: Map },
];

interface ViewSwitcherProps {
  value: ViewMode;
  onChange: (view: ViewMode) => void;
}

/** Timeline / Day / Map switch — real URL-backed state via the page. */
export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as ViewMode)}>
      <TabsList aria-label="Itinerary view">
        {VIEWS.map(({ value: view, label, icon: Icon }) => (
          <TabsTrigger key={view} value={view} className="gap-1.5 px-3">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
