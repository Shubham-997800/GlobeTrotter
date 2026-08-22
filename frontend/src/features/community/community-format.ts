/** Formatting helpers shared by community components. */

/** Compact counter — 1200 → "1.2K". */
export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const thousands = value / 1000;
    return `${thousands >= 10 ? Math.round(thousands) : Math.round(thousands * 10) / 10}K`;
  }
  const millions = value / 1_000_000;
  return `${millions >= 10 ? Math.round(millions) : Math.round(millions * 10) / 10}M`;
}

/** "just now", "5m ago", "3h ago", "2d ago", "1w ago", then a date. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) return "";
  const diff = now.getTime() - timestamp;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  if (diff < 35 * 86_400_000) return `${Math.floor(diff / (7 * 86_400_000))}w ago`;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(
    new Date(timestamp),
  );
}
