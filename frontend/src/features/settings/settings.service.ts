import { DEFAULT_SETTINGS, mergeSettings, type SettingsState } from "./settings.types";

const STORAGE_KEY = "globetrotter.settings";
const LATENCY_MS = 400;

/** Keys owned by GlobeTrotter that "Clear local data" wipes (session kept). */
const APP_DATA_KEYS = [
  STORAGE_KEY,
  "globetrotter.notifications",
  "globetrotter.trips",
  "globetrotter.itineraries",
  "globetrotter.community.posts",
  "globetrotter.community.saved",
];

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeRaw(state: SettingsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — mock only
  }
}

function delay(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock settings service — localStorage-backed. Swap bodies for apiClient
 * calls when a backend lands.
 */
export const settingsService = {
  async get(): Promise<SettingsState> {
    await delay();
    const raw = readRaw();
    if (!raw) return { ...DEFAULT_SETTINGS };
    try {
      return mergeSettings(JSON.parse(raw) as Partial<SettingsState>);
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  async save(next: SettingsState): Promise<SettingsState> {
    await delay();
    writeRaw(next);
    return next;
  },

  /** Exports every locally-stored app blob as pretty-printed JSON. */
  downloadData(): void {
    const bundle: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith("globetrotter.")) continue;
      if (key === "globetrotter.auth.session" || key === "globetrotter.mock.users") {
        continue;
      }
      try {
        bundle[key] = JSON.parse(localStorage.getItem(key) ?? "");
      } catch {
        bundle[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `globetrotter-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  async clearLocalData(): Promise<void> {
    await delay();
    for (const key of APP_DATA_KEYS) {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch {
        // storage unavailable — nothing to clear
      }
    }
  },
};
