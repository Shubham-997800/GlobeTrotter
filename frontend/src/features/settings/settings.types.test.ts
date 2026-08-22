import { describe, expect, it } from "vitest";

import { DEFAULT_SETTINGS, mergeSettings } from "./settings.types";

describe("mergeSettings", () => {
  it("returns defaults when nothing is stored", () => {
    expect(mergeSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  it("deep-merges nested groups over defaults", () => {
    const merged = mergeSettings({
      notifications: {
        push: { tripReminders: false },
        email: { productUpdates: true },
      },
      regional: { currency: "EUR" },
    });
    expect(merged.notifications.push.tripReminders).toBe(false);
    expect(merged.notifications.push.activityReminders).toBe(true);
    expect(merged.notifications.email.productUpdates).toBe(true);
    expect(merged.notifications.email.recommendations).toBe(true);
    expect(merged.regional.currency).toBe("EUR");
    expect(merged.regional.language).toBe(DEFAULT_SETTINGS.regional.language);
  });

  it("keeps unknown top-level keys out of the result shape", () => {
    const merged = mergeSettings({ compactMode: true } as never);
    expect(merged.compactMode).toBe(true);
    expect(Object.keys(merged).sort()).toEqual(
      Object.keys(DEFAULT_SETTINGS).sort(),
    );
  });
});
