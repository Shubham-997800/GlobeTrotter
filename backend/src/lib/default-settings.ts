/** Server-side mirror of the frontend DEFAULT_SETTINGS (settings.types.ts). */
export const DEFAULT_SETTINGS = {
  theme: "system",
  compactMode: false,
  notifications: {
    push: {
      tripReminders: true,
      activityReminders: true,
      bookingUpdates: true,
      communityActivity: true,
    },
    email: {
      tripUpdates: true,
      recommendations: true,
      communityUpdates: false,
      productUpdates: false,
    },
  },
  regional: {
    language: "en",
    currency: "USD",
    dateFormat: "MMM D, YYYY",
    timeFormat: "12h",
    timezone: "system",
  },
  privacy: {
    profileVisibility: "public",
    tripVisibility: "followers",
    showInCommunity: true,
    allowSearchEngines: false,
  },
  connectedAccounts: [
    { id: "conn_google", provider: "Google", connected: false },
    { id: "conn_facebook", provider: "Facebook", connected: false },
    { id: "conn_apple", provider: "Apple", connected: false },
  ],
} as const;
