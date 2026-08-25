import { apiClient } from "@/services/api/client";
import { DEFAULT_SETTINGS, mergeSettings, type SettingsState } from "./settings.types";

/**
 * Real settings service — backend-backed via /api/users/me/settings.
 */
export const settingsService = {
  async get(): Promise<SettingsState> {
    const { data } = await apiClient.get<{ settings: Partial<SettingsState> }>("/users/me/settings");
    return mergeSettings(data.settings ?? {});
  },

  async save(next: SettingsState): Promise<SettingsState> {
    const { data } = await apiClient.put<{ settings: SettingsState }>("/users/me/settings", next);
    return data.settings;
  },

  /** Exports settings as a downloadable JSON file. */
  downloadData(): void {
    const bundle: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key?.startsWith("globetrotter.")) continue;
      if (key === "globetrotter.auth.session" || key === "globetrotter.mock.users") continue;
      try {
        bundle[key] = JSON.parse(localStorage.getItem(key) ?? "");
      } catch {
        bundle[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `globetrotter-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  async clearLocalData(): Promise<void> {
    const APP_DATA_KEYS = [
      "globetrotter.settings",
      "globetrotter.notifications",
      "globetrotter.trips",
      "globetrotter.itineraries",
      "globetrotter.community.posts",
      "globetrotter.community.saved",
    ];
    for (const key of APP_DATA_KEYS) {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch {
        // storage unavailable
      }
    }
  },
};
