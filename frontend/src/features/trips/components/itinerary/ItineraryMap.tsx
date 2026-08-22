import { useEffect, useMemo, useState } from "react";
import { Maximize2, Route as RouteIcon } from "lucide-react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";

import type { ItineraryActivity, ItineraryStop } from "@/features/trips/itinerary.types";
import { coordinateFor } from "@/features/trips/itinerary.data";
import { describeDate } from "@/features/trips/itinerary.utils";
import "leaflet/dist/leaflet.css";

interface ItineraryMapProps {
  stops: ItineraryStop[];
  activities: ItineraryActivity[];
}

export function ItineraryMap({ stops, activities }: ItineraryMapProps) {
  const points = useMemo(() => buildMapPoints(stops, activities), [stops, activities]);
  const [map, setMap] = useState<L.Map | null>(null);

  if (points.length === 0) {
    return (
      <div
        role="status"
        className="flex h-72 items-center justify-center rounded-xl border border-dashed border-subtle-border text-sm text-muted-foreground"
      >
        <span className="inline-flex items-center gap-2">
          <RouteIcon className="h-4 w-4" aria-hidden="true" />
          Add stops or located activities to see the route map.
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-[420px] overflow-hidden rounded-xl border border-border sm:h-[480px]">
      <MapContainer
        ref={setMap}
        center={[20, 78]}
        zoom={3}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline positions={points.map((p) => p.position)} pathOptions={{ color: "#10b981", weight: 2.5, dashArray: "6 8", opacity: 0.75 }} />

        {points.map((point) => (
          <Marker
            key={point.id}
            position={point.position}
            icon={buildPinIcon(point.kind === "stop" ? "stop" : point.index ?? 1)}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <strong>{point.label}</strong>
              {point.sublabel ? (
                <>
                  <br />
                  <span>{point.sublabel}</span>
                </>
              ) : null}
            </Tooltip>
          </Marker>
        ))}

        <FitBounds points={points} />
      </MapContainer>

      <button
        type="button"
        onClick={() => fitToPoints(map, points)}
        title="Reset map view"
        aria-label="Reset map view"
        className="absolute right-3 top-3 z-[500] flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Maximize2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

type MapPoint = {
  id: string;
  kind: "stop" | "activity";
  position: [number, number];
  label: string;
  sublabel?: string;
  index?: number;
};

function buildMapPoints(
  stops: ItineraryStop[],
  activities: ItineraryActivity[],
): MapPoint[] {
  const points: MapPoint[] = [];

  for (const stop of stops) {
    const coords = coordinateFor(stop.destinationId);
    if (coords) {
      points.push({
        id: `stop-${stop.id}`,
        kind: "stop",
        position: [coords.lat, coords.lng],
        label: stop.destinationName,
        sublabel: `${describeDate(stop.arrivalDate)?.shortDate} – ${describeDate(stop.departureDate)?.shortDate}`,
      });
    }
  }

  let activityIndex = 0;
  for (const activity of activities) {
    const coords = coordinateFor(activity.location);
    if (!coords) continue;
    activityIndex += 1;
    points.push({
      id: `activity-${activity.id}`,
      kind: "activity",
      position: [coords.lat, coords.lng],
      label: activity.name,
      sublabel: `${describeDate(activity.dayId.replace(/^day_/, ""))?.shortDate ?? ""} · ${activity.startTime}`.trim(),
      index: activityIndex,
    });
  }

  return points;
}

function buildPinIcon(kind: "stop" | number): L.DivIcon {
  const isStop = kind === "stop";
  const label = isStop ? "★" : String(kind);
  return L.divIcon({
    className: "",
    html: `
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:${isStop ? 30 : 24}px;height:${isStop ? 30 : 24}px;
        border-radius:9999px;
        background:${isStop ? "#0f766e" : "#059669"};
        color:#fff;font-size:${isStop ? 14 : 11}px;font-weight:700;
        font-family:ui-sans-serif,system-ui,sans-serif;
        border:2px solid #ffffff;
        box-shadow:0 1px 6px rgba(15,23,42,.35);
      ">${label}</div>`,
    iconSize: [isStop ? 30 : 24, isStop ? 30 : 24],
    iconAnchor: [isStop ? 15 : 12, isStop ? 30 : 24],
    tooltipAnchor: [0, -14],
  });
}

function fitToPoints(map: L.Map | null, points: MapPoint[]) {
  if (!map || points.length === 0) return;
  if (points.length === 1) {
    map.setView(points[0].position, 10);
    return;
  }
  map.fitBounds(L.latLngBounds(points.map((p) => p.position)), { padding: [36, 36] });
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    fitToPoints(map, points);
  }, [map, points]);

  return null;
}