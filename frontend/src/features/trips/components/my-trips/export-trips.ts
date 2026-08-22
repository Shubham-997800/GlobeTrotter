import type { TripRecord } from "../../trips.types";
import {
  resolveDestination,
  resolveTripStatus,
} from "../../my-trips.logic";

export type ExportFormat = "csv" | "json";

const CSV_HEADERS = [
  "Trip Name",
  "Destination",
  "Country",
  "Start Date",
  "End Date",
  "Days",
  "Status",
  "Planning Progress (%)",
  "Total Budget",
  "Currency",
  "Activities Added",
  "Created At",
  "Updated At",
];

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Actual persisted data + honestly derived fields — nothing invented. */
function exportRows(records: TripRecord[]) {
  return records.map((record) => {
    const destination = resolveDestination(record.destinationId);
    const start = new Date(`${record.startDate}T00:00:00Z`).getTime();
    const end = new Date(`${record.endDate}T00:00:00Z`).getTime();
    const days =
      Number.isNaN(start) || Number.isNaN(end) || end < start
        ? ""
        : String(Math.round((end - start) / 86_400_000) + 1);
    return {
      name: record.name,
      city: destination?.city ?? record.destinationId,
      country: destination?.country ?? "",
      startDate: record.startDate,
      endDate: record.endDate,
      days,
      status: resolveTripStatus(record),
      progress: record.status === "draft" ? "draft" : "planned",
      budget: record.budgetAmount,
      currency: record.currency,
      activities: record.activityIds?.length ?? 0,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt ?? record.createdAt,
    };
  });
}

function buildCsv(records: TripRecord[]): string {
  const rows = exportRows(records);
  const lines = [
    CSV_HEADERS.join(","),
    ...rows.map((row) =>
      [
        row.name,
        row.city,
        row.country,
        row.startDate,
        row.endDate,
        row.days,
        row.status,
        row.progress,
        row.budget,
        row.currency,
        row.activities,
        row.createdAt,
        row.updatedAt,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  return lines.join("\n");
}

/**
 * Client-side file generation from real selected trip records — no
 * external export library needed.
 */
export function downloadTripsExport(
  records: TripRecord[],
  format: ExportFormat,
): void {
  if (records.length === 0) return;
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `globetrotter-trips-${stamp}.${format}`;

  let blob: Blob;
  if (format === "csv") {
    // BOM keeps Excel happy with UTF-8 names like "Kyoto".
    blob = new Blob([`\uFEFF${buildCsv(records)}`], {
      type: "text/csv;charset=utf-8;",
    });
  } else {
    blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), trips: exportRows(records) }, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
